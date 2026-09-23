"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthMeter, passwordMeetsRequirements } from "@/components/auth/PasswordStrengthMeter";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordMeetsRequirements(password)) {
      setError("Le mot de passe ne respecte pas encore toutes les règles ci-dessous.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Un compte existe déjà avec cet email."
          : "Une erreur est survenue. Réessayez dans un instant."
      );
      return;
    }

    // Le trigger on_auth_user_created a déjà créé le profil côté base.
    // Direction : génération de la clé de récupération.
    router.push("/recovery-key");
  }

  async function handleGoogleSignUp() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/recovery-key` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-line p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Rejoindre OverLine Africa Hub</h1>
        <p className="font-sans text-sm text-ink/60 mb-6">
          Créez votre compte en une minute.
        </p>

        <Button
          type="button"
          variant="secondary"
          className="w-full mb-4"
          onClick={handleGoogleSignUp}
        >
          Continuer avec Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-line" />
          <span className="font-sans text-xs text-ink/40">ou</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nom complet"
            name="full_name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <div className="flex flex-col gap-2">
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {password.length > 0 && <PasswordStrengthMeter password={password} />}
          </div>

          {error && <p className="font-sans text-sm text-clay">{error}</p>}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Créer mon compte
          </Button>
        </form>

        <p className="font-sans text-sm text-ink/60 mt-6 text-center">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-indigo font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
