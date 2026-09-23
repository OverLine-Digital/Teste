"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { SECTORS } from "@/lib/sectors";
import { ROLE_LABELS, type AccountType, type UserRole } from "@/lib/types";

const TOTAL_STEPS = 5;

type LanguageOption = { code: string; name_fr: string };

export default function QuiEtesVousPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Réponses
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("fr");
  const [receptionLanguages, setReceptionLanguages] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [companyRegistrationCountry, setCompanyRegistrationCountry] = useState("");

  useEffect(() => {
    supabase
      .from("languages")
      .select("code, name_fr")
      .eq("is_active", true)
      .order("name_fr")
      .then(({ data }) => setLanguages(data ?? []));
  }, [supabase]);

  function toggleSector(sector: string) {
    setSectors((prev) => {
      if (prev.includes(sector)) return prev.filter((s) => s !== sector);
      if (prev.length >= 2) return prev; // Maximum 2, imposé côté UI
      return [...prev, sector];
    });
  }

  function toggleReceptionLanguage(code: string) {
    setReceptionLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function canGoNext(): boolean {
    if (step === 1) return accountType !== null;
    if (step === 2) return role !== null;
    if (step === 3) return sectors.length > 0;
    if (step === 4) {
      const baseValid = country.trim().length > 0 && city.trim().length > 0;
      if (accountType === "entreprise") {
        return baseValid && companyName.trim().length > 0 && companyRegistrationCountry.trim().length > 0;
      }
      return baseValid;
    }
    return true; // Étape 5 (langues) a des valeurs par défaut
  }

  async function handleFinish() {
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

    // 1. Mise à jour du profil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        account_type: accountType,
        role,
        country,
        city,
        preferred_language_code: preferredLanguage,
        reception_languages: receptionLanguages,
        onboarding_step: "verification_pending",
      })
      .eq("id", user.id);

    if (profileError) {
      setError("Une erreur est survenue lors de l'enregistrement. Réessayez.");
      setSubmitting(false);
      return;
    }

    // 2. Ligne companies pour TOUT LE MONDE — sert d'identité d'acteur pour
    // publier, envoyer des messages, passer des appels, etc. (posts.author_id,
    // messages.sender_id... référencent tous companies.id, hérité de l'époque
    // où seules les entreprises existaient sur la plateforme). Un compte
    // individuel obtient donc aussi une ligne, avec son nom personnel.
    // Le nom complet a été saisi à l'inscription, on le relit ici pour
    // nommer la ligne companies d'un compte individuel.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { data: newCompany, error: companyError } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        name: accountType === "entreprise" ? companyName : existingProfile?.full_name ?? "Compte individuel",
        country: accountType === "entreprise" ? companyRegistrationCountry : country,
        sectors,
      })
      .select("id")
      .single();

    if (companyError) {
      setError("Profil enregistré, mais la création de votre identité d'acteur a échoué. Contactez le support.");
      setSubmitting(false);
      return;
    }

    // 3. Profil freelance additionnel (compétences, tarif) si applicable —
    // en plus de la ligne companies ci-dessus, pas à la place.
    if (role === "freelance") {
      const { error: freelancerError } = await supabase.from("freelancer_profiles").insert({
        user_id: user.id,
      });
      if (freelancerError) {
        setError("Profil enregistré, mais la création du profil freelance a échoué. Contactez le support.");
        setSubmitting(false);
        return;
      }
    }

    router.push("/verification");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4">
      <div className="w-full max-w-lg bg-white rounded-lg border border-line p-8">
        <OnboardingStepper current={step} total={TOTAL_STEPS} />

        {step === 1 && (
          <fieldset>
            <legend className="font-display text-xl text-ink mb-4">Vous représentez :</legend>
            <div className="flex flex-col gap-3">
              <OptionButton
                selected={accountType === "entreprise"}
                onClick={() => setAccountType("entreprise")}
                label="Une entreprise / structure organisée"
              />
              <OptionButton
                selected={accountType === "individuel"}
                onClick={() => setAccountType("individuel")}
                label="Vous-même (commerçant indépendant, investisseur individuel, diaspora)"
              />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="font-display text-xl text-ink mb-4">Votre activité principale :</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                <OptionButton
                  key={value}
                  compact
                  selected={role === value}
                  onClick={() => setRole(value)}
                  label={label}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="font-display text-xl text-ink mb-1">Dans quel(s) secteur(s) ?</legend>
            <p className="font-sans text-xs text-ink/50 mb-4">Maximum 2</p>
            <div className="flex flex-wrap gap-2.5">
              {SECTORS.map((sector) => (
                <OptionButton
                  key={sector}
                  compact
                  selected={sectors.includes(sector)}
                  onClick={() => toggleSector(sector)}
                  label={sector}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-xl text-ink mb-1">Où êtes-vous basé ?</legend>
            <Input label="Pays" name="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <Input label="Ville" name="city" value={city} onChange={(e) => setCity(e.target.value)} />

            {accountType === "entreprise" && (
              <>
                <div className="h-px bg-line my-1" />
                <Input
                  label="Nom de l'entreprise"
                  name="company_name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  label="Pays d'enregistrement"
                  name="company_registration_country"
                  value={companyRegistrationCountry}
                  onChange={(e) => setCompanyRegistrationCountry(e.target.value)}
                />
              </>
            )}
          </fieldset>
        )}

        {step === 5 && (
          <fieldset>
            <legend className="font-display text-xl text-ink mb-1">Langues</legend>
            <p className="font-sans text-xs text-ink/50 mb-4">
              Le Language Bridge traduira automatiquement les conversations sauf dans les langues
              que vous acceptez de recevoir directement.
            </p>

            <label className="font-sans text-sm font-medium text-ink block mb-1.5">
              Langue principale
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5 mb-4"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name_fr}
                </option>
              ))}
            </select>

            <label className="font-sans text-sm font-medium text-ink block mb-1.5">
              Langues de réception acceptées (optionnel)
            </label>
            <div className="flex flex-wrap gap-2">
              {languages
                .filter((l) => l.code !== preferredLanguage)
                .map((lang) => (
                  <OptionButton
                    key={lang.code}
                    compact
                    selected={receptionLanguages.includes(lang.code)}
                    onClick={() => toggleReceptionLanguage(lang.code)}
                    label={lang.name_fr}
                  />
                ))}
            </div>
          </fieldset>
        )}

        {error && <p className="font-sans text-sm text-clay mt-4">{error}</p>}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Retour
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              className="flex-1"
              disabled={!canGoNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continuer
            </Button>
          ) : (
            <Button type="button" className="flex-1" loading={submitting} onClick={handleFinish}>
              Terminer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  label,
  compact,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-sans text-sm text-left rounded-md border px-4 transition-colors ${
        compact ? "py-2" : "py-3.5"
      } ${
        selected
          ? "border-indigo bg-indigo/5 text-indigo font-medium"
          : "border-line text-ink hover:border-ink/30"
      }`}
    >
      {label}
    </button>
  );
}
