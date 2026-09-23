"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const PARTNER_TYPES = [
  { value: "distributeur", label: "Distributeur" },
  { value: "representant_commercial", label: "Représentant commercial" },
  { value: "agence_marketing", label: "Agence marketing" },
  { value: "partenaire_implantation", label: "Partenaire d'implantation" },
  { value: "grossiste", label: "Grossiste" },
  { value: "importateur", label: "Importateur" },
  { value: "transporteur", label: "Transporteur" },
  { value: "entrepot", label: "Entrepôt" },
  { value: "representant_local", label: "Représentant local" },
  { value: "autre", label: "Autre" },
] as const;

export function NewPartnerRequestForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [partnerType, setPartnerType] = useState<string>("distributeur");
  const [targetCountry, setTargetCountry] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetCountry.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("business_partner_requests").insert({
      requester_company_id: companyId,
      partner_type: partnerType,
      target_country: targetCountry.trim(),
      description: description.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError("La publication a échoué. Réessayez.");
      return;
    }

    setTargetCountry("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-ink">Type de partenaire recherché</label>
          <select
            value={partnerType}
            onChange={(e) => setPartnerType(e.target.value)}
            className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5"
          >
            {PARTNER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <Input label="Pays ciblé" value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-ink">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder='Ex: "Je cherche un distributeur au Congo pour mes produits textiles"'
          className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo/40"
        />
      </div>

      {error && <p className="font-sans text-xs text-clay">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!targetCountry.trim()} className="self-end">
        Publier la demande
      </Button>
    </form>
  );
}
