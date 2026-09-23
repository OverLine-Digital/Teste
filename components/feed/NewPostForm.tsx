"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const POST_TYPES = [
  { value: "annonce", label: "Annonce" },
  { value: "recherche_fournisseur", label: "Recherche fournisseur" },
  { value: "recherche_distributeur", label: "Recherche distributeur" },
  { value: "rfq", label: "Demande de devis (RFQ)" },
  { value: "recherche_partenaire_business", label: "Recherche de partenaire" },
  { value: "capacite_disponible", label: "Capacité disponible" },
  { value: "offre_emploi", label: "Offre d'emploi" },
  { value: "offre_freelance", label: "Offre de service freelance" },
] as const;

// Ces types touchent au cœur du B2B — proposés par défaut en visibilité
// restreinte (invisible pour commerçant/vendeur/freelance), ajustable.
const RESTRICTABLE_TYPES = new Set(["rfq", "recherche_partenaire_business", "recherche_fournisseur", "recherche_distributeur"]);

export function NewPostForm({ onPosted }: { onPosted?: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<string>("annonce");
  const [content, setContent] = useState("");
  const [entreprisesUniquement, setEntreprisesUniquement] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      author_id: user.id,
      type,
      content: content.trim(),
      zone_config: {},
      audience: entreprisesUniquement ? "entreprises_uniquement" : "tous",
    });

    setSubmitting(false);

    if (insertError) {
      setError("La publication a échoué. Réessayez.");
      return;
    }

    setContent("");
    onPosted?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 flex flex-col gap-3">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="font-sans text-sm rounded-md border border-line bg-white px-3 py-2 self-start"
      >
        {POST_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Que recherchez-vous ou que proposez-vous ?"
        rows={3}
        className="font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo/40"
      />

      {RESTRICTABLE_TYPES.has(type) && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={entreprisesUniquement}
            onChange={(e) => setEntreprisesUniquement(e.target.checked)}
          />
          <span className="font-sans text-xs text-ink/60">
            Réserver aux entreprises (invisible pour commerçants, vendeurs et freelances)
          </span>
        </label>
      )}

      {error && <p className="font-sans text-xs text-clay">{error}</p>}

      <Button type="submit" loading={submitting} disabled={!content.trim()} className="self-end">
        Publier
      </Button>
    </form>
  );
}
