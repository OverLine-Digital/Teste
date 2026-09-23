import Link from "next/link";

export function VerificationBanner() {
  return (
    <div className="bg-gold/10 border-b border-gold/30 px-6 py-2.5 flex items-center justify-between">
      <p className="font-sans text-sm text-ink">
        Votre compte n'est pas encore vérifié. Complétez votre vérification pour publier et
        contacter d'autres membres.
      </p>
      <Link href="/verification" className="font-sans text-sm font-medium text-indigo shrink-0 ml-4">
        Vérifier maintenant
      </Link>
    </div>
  );
}
