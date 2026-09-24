"use client";

import { useState } from "react";
import Link from "next/link";

type SearchResult = {
  description: string;
  keywords: string[];
  products: { id: string; name: string; category: string | null; price: number | null; currency: string; company_id: string }[];
  services: { id: string; name: string; category: string; description: string | null; company_id: string }[];
};

export function PhotoSearch() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/search/photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Recherche échouée");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <label htmlFor="photo-search" className="cursor-pointer">
        <div className="border-2 border-dashed border-line rounded-md py-6 text-center hover:border-indigo/40 transition-colors">
          <p className="font-sans text-sm text-ink/60">
            📸 Rechercher par photo — glissez une image ou cliquez ici
          </p>
        </div>
        <input
          id="photo-search"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {previewUrl && (
        <img src={previewUrl} alt="Aperçu" className="mt-4 h-24 w-24 object-cover rounded-md" />
      )}

      {loading && <p className="font-sans text-sm text-ink/50 mt-3">Analyse de l'image…</p>}
      {error && <p className="font-sans text-sm text-clay mt-3">{error}</p>}

      {result && (
        <div className="mt-4">
          <p className="font-sans text-xs text-ink/50 mb-3">
            Reconnu : <span className="italic">{result.description}</span>
          </p>

          {result.products.length === 0 && result.services.length === 0 ? (
            <p className="font-sans text-sm text-ink/50">Aucun résultat correspondant.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {result.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/entreprise/${p.company_id}`}
                  className="flex items-center justify-between border border-line rounded-md px-3 py-2 hover:bg-stone-dim"
                >
                  <span className="font-sans text-sm text-ink">{p.name}</span>
                  {p.price && (
                    <span className="font-sans text-xs text-ink/60">
                      {p.price} {p.currency}
                    </span>
                  )}
                </Link>
              ))}
              {result.services.map((s) => (
                <div key={s.id} className="border border-line rounded-md px-3 py-2">
                  <span className="font-sans text-sm text-ink">{s.name}</span>
                  <span className="font-sans text-xs text-ink/50 ml-2">{s.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
