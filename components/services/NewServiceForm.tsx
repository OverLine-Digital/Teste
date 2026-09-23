"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SERVICE_CATEGORIES } from "@/lib/serviceCategories";

const PRICING_MODELS = [
  { value: "forfait", label: "Forfait" },
  { value: "horaire", label: "Horaire" },
  { value: "sur_devis", label: "Sur devis" },
  { value: "abonnement", label: "Abonnement" },
] as const;

export function NewServiceForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [pricingModel, setPricingModel] = useState<string>("sur_devis");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("services").insert({
      company_id: companyId,
      name: name.trim(),
      category,
      description: description.trim() || null,
      pricing_model: pricingModel,
      price: price ? Number(price) : null,
      coverage_countries: [],
    });

    setSubmitting(false);

    if (insertError) {
      setError("L'ajout a échoué. Réessayez.");
      return;
    }

    setName("");
    setDescription("");
    setPrice("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 flex flex-col gap-3">
      <h2 className="font-sans text-sm font-semibold text-ink">Ajouter un service</h2>
      <Input label="Nom du service" value={name} onChange={(e) => setName(e.target.value)} required />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-ink">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5"
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-ink">Tarification</label>
          <select
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value)}
            className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5"
          >
            {PRICING_MODELS.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pricingModel !== "sur_devis" && (
        <Input label="Prix (USD)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      )}

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-ink">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo/40"
        />
      </div>

      {error && <p className="font-sans text-xs text-clay">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!name.trim()} className="self-end">
        Ajouter
      </Button>
    </form>
  );
}
