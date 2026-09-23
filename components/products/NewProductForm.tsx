"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewProductForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("products").insert({
      company_id: companyId,
      name: name.trim(),
      category: category.trim() || null,
      price: price ? Number(price) : null,
      currency,
      min_order_quantity: minOrderQuantity ? Number(minOrderQuantity) : null,
      availability_countries: [],
      images: [],
    });

    setSubmitting(false);

    if (insertError) {
      setError("L'ajout a échoué. Réessayez.");
      return;
    }

    setName("");
    setCategory("");
    setPrice("");
    setMinOrderQuantity("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 flex flex-col gap-3">
      <h2 className="font-sans text-sm font-semibold text-ink">Ajouter un produit</h2>
      <Input label="Nom du produit" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Prix" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input
          label="Quantité minimale de commande"
          type="number"
          value={minOrderQuantity}
          onChange={(e) => setMinOrderQuantity(e.target.value)}
        />
      </div>
      {error && <p className="font-sans text-xs text-clay">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!name.trim()} className="self-end">
        Ajouter
      </Button>
    </form>
  );
}
