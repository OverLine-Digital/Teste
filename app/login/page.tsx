"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Le middleware se charge de rediriger vers la bonne étape
    // (confirm-email, qui-etes-vous, ou feed) selon l'état du compte.
    router.push("/feed");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/feed` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-line p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Bon retour</h1>
        <p className="font-sans text-sm text-ink/60 mb-6">Connectez-vous à votre compte.</p>

        <Button type="button" variant="secondary" className="w-full mb-4" onClick={handleGoogleSignIn}>
          Continuer avec Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-line" />
          <span className="font-sans text-xs text-ink/40">ou</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="font-sans text-sm text-clay">{error}</p>}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Se connecter
          </Button>
        </form>

        <p className="font-sans text-sm text-ink/60 mt-6 text-center">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-indigo font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
