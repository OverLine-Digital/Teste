"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ConfirmEmailPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-line p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h1 className="font-display text-2xl text-ink mb-2">Confirmez votre adresse email</h1>
        <p className="font-sans text-sm text-ink/60 mb-6">
          Nous avons envoyé un lien à{" "}
          <span className="font-medium text-ink">{email ?? "votre adresse"}</span>. Cliquez dessus
          pour continuer. Cette page se mettra à jour automatiquement une fois le lien cliqué.
        </p>

        {sent && (
          <p className="font-sans text-sm text-teal mb-4">Email renvoyé avec succès.</p>
        )}

        <Button type="button" variant="secondary" onClick={handleResend} loading={loading} className="w-full">
          Renvoyer l'email
        </Button>
      </div>
    </div>
  );
}
