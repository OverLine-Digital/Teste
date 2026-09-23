import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Recherche par photo : la photo est décrite en texte par DeepSeek Vision,
// puis cette description sert de requête sur les produits/services déjà
// en base. DeepSeek n'offre pas d'embedding visuel comparable à CLIP —
// voir la discussion avec l'équipe : ceci est le choix retenu.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("photo") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Aucune photo fournie" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = buffer.toString("base64");

  const serviceClient = createServiceClient();
  const { data: apiKey } = await serviceClient.rpc("get_secret", { secret_name: "vision_api_key" });

  if (!apiKey) {
    return NextResponse.json({ error: "Clé de vision non configurée" }, { status: 500 });
  }

  // Étape 1 — DeepSeek Vision décrit l'image en quelques mots-clés commerciaux
  const visionResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Décris ce produit ou service en 5 mots-clés commerciaux maximum, séparés par des virgules, sans phrase complète. Exemple: chaussures de sport, blanc, semelle épaisse, running",
            },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } },
          ],
        },
      ],
      max_tokens: 60,
    }),
  });

  if (!visionResponse.ok) {
    return NextResponse.json({ error: "Échec de l'analyse de l'image" }, { status: 502 });
  }

  const visionData = await visionResponse.json();
  const description: string = visionData.choices?.[0]?.message?.content ?? "";
  const keywords = description
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keywords.length === 0) {
    return NextResponse.json({ description, products: [], services: [] });
  }

  // Étape 2 — recherche texte classique sur produits ET services avec ces mots-clés
  const orFilter = keywords.map((k) => `name.ilike.%${k}%,category.ilike.%${k}%`).join(",");

  const [{ data: products }, { data: services }] = await Promise.all([
    supabase.from("products").select("id, name, category, price, currency, company_id").or(orFilter).limit(10),
    supabase.from("services").select("id, name, category, description, company_id").or(orFilter).limit(10),
  ]);

  return NextResponse.json({ description, keywords, products: products ?? [], services: services ?? [] });
}
