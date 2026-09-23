"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function RecoveryKeyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generate() {
      const { data, error: rpcError } = await supabase.rpc("generate_recovery_key");
      setLoading(false);

      if (rpcError) {
        // Une clé active existe déjà (ex: rechargement de page) — pas bloquant,
        // on laisse la personne continuer sans en générer une nouvelle.
        setError(
          "Votre clé a déjà été générée précédemment. Continuez vers la suite de l'inscription."
        );
        return;
      }
      setRecoveryKey(data as string);
    }
    generate();
  }, [supabase]);

  function handleCopy() {
    if (!recoveryKey) return;
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
  }

  function handleDownload() {
    if (!recoveryKey) return;
    const blob = new Blob(
      [`Clé de récupération OverLine Africa Hub\n\n${recoveryKey}\n\nConservez ce fichier en lieu sûr. Cette clé ne sera plus jamais affichée.`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "overline-cle-recuperation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleContinue() {
    router.push("/confirm-email");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4">
      <div className="w-full max-w-lg bg-white rounded-lg border border-line p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Votre clé de récupération</h1>
        <p className="font-sans text-sm text-ink/60 mb-6">
          Cette clé ne sera plus jamais affichée. Notez-la ou téléchargez-la maintenant.
        </p>

        {loading && <p className="font-sans text-sm text-ink/60">Génération en cours…</p>}

        {error && (
          <div className="mb-4">
            <p className="font-sans text-sm text-ink/60">{error}</p>
          </div>
        )}

        {recoveryKey && (
          <>
            <div className="bg-stone border border-line rounded-md px-5 py-4 mb-4 text-center">
              <code className="font-sans text-lg font-semibold text-indigo tracking-wide">
                {recoveryKey}
              </code>
            </div>

            <div className="flex gap-3 mb-6">
              <Button type="button" variant="secondary" onClick={handleCopy} className="flex-1">
                {copied ? "Copié ✓" : "Copier"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleDownload} className="flex-1">
                Télécharger en .txt
              </Button>
            </div>

            <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span className="font-sans text-sm text-ink">
                J'ai bien noté ma clé de récupération. Je comprends qu'elle ne sera plus jamais
                affichée.
              </span>
            </label>
          </>
        )}

        <Button
          type="button"
          onClick={handleContinue}
          disabled={!!recoveryKey && !confirmed}
          className="w-full"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
