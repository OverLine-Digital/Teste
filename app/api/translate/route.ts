import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Language Bridge : traduit un message et conserve le contexte structuré
// (prix/quantité/délai) sans le traduire — ce sont des nombres, pas du texte.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { messageId, targetLanguageCode } = await request.json();
  if (!messageId || !targetLanguageCode) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Traduction déjà en cache ?
  const { data: cached } = await supabase
    .from("message_translations")
    .select("translated_content")
    .eq("message_id", messageId)
    .eq("language_code", targetLanguageCode)
    .single();

  if (cached) {
    return NextResponse.json({ translated: cached.translated_content, cached: true });
  }

  const { data: message } = await supabase
    .from("messages")
    .select("content")
    .eq("id", messageId)
    .single();

  if (!message?.content) {
    return NextResponse.json({ error: "Message introuvable ou vide" }, { status: 404 });
  }

  const { data: language } = await supabase
    .from("languages")
    .select("name_fr")
    .eq("code", targetLanguageCode)
    .single();

  const serviceClient = createServiceClient();
  const { data: apiKey } = await serviceClient.rpc("get_secret", { secret_name: "vision_api_key" });

  if (!apiKey) {
    return NextResponse.json({ error: "Clé de traduction non configurée" }, { status: 500 });
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `Tu traduis des messages commerciaux B2B vers le ${language?.name_fr ?? targetLanguageCode}. Traduis fidèlement, garde un registre professionnel, ne rajoute aucun commentaire, réponds uniquement avec la traduction.`,
        },
        { role: "user", content: message.content },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Échec de la traduction" }, { status: 502 });
  }

  const data = await response.json();
  const translated: string = data.choices?.[0]?.message?.content ?? "";

  await supabase.from("message_translations").insert({
    message_id: messageId,
    language_code: targetLanguageCode,
    translated_content: translated,
  });

  return NextResponse.json({ translated, cached: false });
}
