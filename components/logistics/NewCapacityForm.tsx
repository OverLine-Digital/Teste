"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const CAPACITY_TYPES = [
  { value: "transport", label: "Transport" },
  { value: "entrepot", label: "Entrepôt" },
  { value: "production", label: "Production" },
  { value: "machine", label: "Machine" },
  { value: "personnel", label: "Personnel" },
  { value: "import", label: "Import (place conteneur)" },
  { value: "equipement", label: "Équipement" },
  { value: "espace", label: "Espace" },
  { value: "conteneur", label: "Conteneur" },
  { value: "service", label: "Service" },
] as const;

export function NewCapacityForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<string>("transport");
  const [originCountry, setOriginCountry] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("tonnes");
  const [availableFrom, setAvailableFrom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTransport = type === "transport";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("capacities").insert({
      company_id: companyId,
      type,
      origin_country: originCountry || null,
      origin_city: originCity || null,
      destination_country: isTransport ? destinationCountry || null : null,
      destination_city: isTransport ? destinationCity || null : null,
      quantity: quantity ? Number(quantity) : null,
      unit,
      available_from: availableFrom || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError("L'ajout a échoué. Réessayez.");
      return;
    }

    setOriginCountry("");
    setOriginCity("");
    setDestinationCountry("");
    setDestinationCity("");
    setQuantity("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 flex flex-col gap-3">
      <h2 className="font-sans text-sm font-semibold text-ink">Déclarer une capacité</h2>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="font-sans text-sm rounded-md border border-line bg-white px-3 py-2 self-start"
      >
        {CAPACITY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Pays de départ" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} />
        <Input label="Ville de départ" value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
      </div>

      {isTransport && (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Pays de destination" value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} required />
          <Input label="Ville de destination" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Input label="Quantité" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-ink">Unité</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5"
          >
            <option value="tonnes">tonnes</option>
            <option value="m²">m²</option>
            <option value="unités">unités</option>
            <option value="jours">jours</option>
          </select>
        </div>
        <Input label="Disponible à partir du" type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
      </div>

      {error && <p className="font-sans text-xs text-clay">{error}</p>}
      <Button type="submit" loading={submitting} className="self-end">
        Publier cette capacité
      </Button>
    </form>
  );
}
