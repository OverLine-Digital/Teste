"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewLogisticsRequestForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [originCountry, setOriginCountry] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goodsType, setGoodsType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMatchCount(null);

    const { data, error: insertError } = await supabase
      .from("logistics_requests")
      .insert({
        requester_company_id: companyId,
        origin_country: originCountry,
        origin_city: originCity || null,
        destination_country: destinationCountry,
        destination_city: destinationCity || null,
        weight_kg: weightKg ? Number(weightKg) : null,
        goods_type: goodsType || null,
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setSubmitting(false);
      setError("La demande a échoué. Réessayez.");
      return;
    }

    // Le trigger de matching a déjà tourné côté base — on regarde combien
    // de propositions sont immédiatement disponibles.
    const { count } = await supabase
      .from("logistics_matches")
      .select("id", { count: "exact", head: true })
      .eq("logistics_request_id", data.id);

    setSubmitting(false);
    setMatchCount(count ?? 0);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 flex flex-col gap-3">
      <h2 className="font-sans text-sm font-semibold text-ink">Demander un transport</h2>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Pays de départ" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} required />
        <Input label="Ville de départ" value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Pays de destination" value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} required />
        <Input label="Ville de destination" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Poids (kg)" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        <Input label="Type de marchandise" value={goodsType} onChange={(e) => setGoodsType(e.target.value)} />
      </div>

      {error && <p className="font-sans text-xs text-clay">{error}</p>}
      {matchCount !== null && (
        <p className="font-sans text-xs text-teal">
          {matchCount > 0
            ? `${matchCount} transporteur(s) disponible(s) sur ce trajet trouvé(s) automatiquement.`
            : "Aucun transporteur disponible pour l'instant sur ce trajet — vous serez notifié dès qu'une capacité correspondante sera déclarée."}
        </p>
      )}

      <Button type="submit" loading={submitting} className="self-end">
        Publier la demande
      </Button>
    </form>
  );
}
