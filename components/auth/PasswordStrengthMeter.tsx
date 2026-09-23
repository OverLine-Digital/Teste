"use client";

import clsx from "clsx";

type Rule = { label: string; test: (pw: string) => boolean };

const RULES: Rule[] = [
  { label: "12 caractères minimum", test: (pw) => pw.length >= 12 },
  { label: "Une majuscule", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Une minuscule", test: (pw) => /[a-z]/.test(pw) },
  { label: "Un chiffre", test: (pw) => /[0-9]/.test(pw) },
  { label: "Un caractère spécial", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

// Rejet des mots de passe trop communs, même s'ils respectent les règles ci-dessus
const COMMON_PASSWORDS = new Set([
  "password123",
  "azerty123456",
  "motdepasse123",
  "12345678910!",
]);

export function passwordMeetsRequirements(password: string): boolean {
  return RULES.every((rule) => rule.test(password)) && !COMMON_PASSWORDS.has(password.toLowerCase());
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const passedCount = RULES.filter((rule) => rule.test(password)).length;
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());
  const strength = isCommon ? 0 : passedCount;

  const strengthLabel =
    strength <= 1 ? "Faible" : strength <= 3 ? "Moyen" : strength === 4 ? "Fort" : "Excellent";

  const strengthColor =
    strength <= 1 ? "bg-clay" : strength <= 3 ? "bg-gold" : "bg-teal";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < strength ? strengthColor : "bg-line"
            )}
          />
        ))}
      </div>
      <p className="font-sans text-xs text-ink/60">
        Force du mot de passe : <span className="font-medium">{strengthLabel}</span>
      </p>
      <ul className="font-sans text-xs text-ink/60 space-y-1">
        {RULES.filter((rule) => !rule.test(password)).map((rule) => (
          <li key={rule.label}>· {rule.label}</li>
        ))}
        {isCommon && <li className="text-clay">· Ce mot de passe est trop courant, choisissez-en un autre</li>}
      </ul>
    </div>
  );
}
