const CHECK_LABELS: Record<string, string> = {
  identite_legale: "Identité vérifiée",
  telephone: "Téléphone vérifié",
  adresse: "Adresse vérifiée",
  documents: "Documents vérifiés",
  compte_bancaire: "Compte bancaire vérifié",
  visite_physique: "Visite physique effectuée",
  activite: "Activité vérifiée",
  responsable: "Responsable identifié",
  produits_services: "Produits/services vérifiés",
  capacite_commerciale: "Capacité commerciale vérifiée",
  capacite_exportation: "Capacité d'exportation vérifiée",
};

type CheckEntry = { status: string; verified_at: string | null };

export type TrustPassport = {
  company_name: string;
  country: string | null;
  checks: Record<string, CheckEntry> | null;
  entreprise_rencontree: boolean;
  derniere_verification: string | null;
  total_transactions: number;
  completed_transactions: number;
  unresolved_disputes: number;
  resolved_disputes: number;
  avg_response_time_hours: number | null;
  last_activity_at: string | null;
};

export function TrustPassportCard({ passport }: { passport: TrustPassport }) {
  const checks = passport.checks ?? {};
  const verifiedCount = Object.values(checks).filter((c) => c.status === "verified").length;
  const totalChecks = Object.keys(CHECK_LABELS).length;

  return (
    <div className="bg-white border border-line rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Passeport commercial</h2>
        <span className="font-sans text-xs font-medium text-teal bg-teal/10 rounded-full px-3 py-1">
          {verifiedCount}/{totalChecks} vérifications
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {Object.entries(CHECK_LABELS).map(([key, label]) => {
          const entry = checks[key];
          const isVerified = entry?.status === "verified";
          return (
            <li key={key} className="flex items-center gap-2 font-sans text-sm">
              <span className={isVerified ? "text-teal" : "text-ink/30"}>
                {isVerified ? "✅" : "⬜"}
              </span>
              <span className={isVerified ? "text-ink" : "text-ink/40"}>{label}</span>
            </li>
          );
        })}
      </ul>

      {passport.derniere_verification && (
        <p className="font-sans text-xs text-ink/50 mb-5">
          Dernière vérification :{" "}
          {new Date(passport.derniere_verification).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      <div className="border-t border-line pt-4">
        <p className="font-sans text-xs font-medium text-ink/50 uppercase tracking-wide mb-3">
          Niveau de confiance basé sur des preuves
        </p>
        <dl className="grid grid-cols-2 gap-y-2 font-sans text-sm">
          <dt className="text-ink/60">Entreprise rencontrée</dt>
          <dd className="text-ink font-medium">{passport.entreprise_rencontree ? "Oui" : "Non"}</dd>

          <dt className="text-ink/60">Transactions OverLine</dt>
          <dd className="text-ink font-medium">{passport.total_transactions}</dd>

          <dt className="text-ink/60">Transactions complétées</dt>
          <dd className="text-ink font-medium">{passport.completed_transactions}</dd>

          <dt className="text-ink/60">Litiges</dt>
          <dd className="text-ink font-medium">
            {passport.resolved_disputes} résolu(s)
            {passport.unresolved_disputes > 0 && (
              <span className="text-clay"> · {passport.unresolved_disputes} non résolu(s)</span>
            )}
          </dd>

          {passport.avg_response_time_hours != null && (
            <>
              <dt className="text-ink/60">Réponse moyenne</dt>
              <dd className="text-ink font-medium">{Math.round(passport.avg_response_time_hours)} h</dd>
            </>
          )}

          {passport.last_activity_at && (
            <>
              <dt className="text-ink/60">Dernière activité</dt>
              <dd className="text-ink font-medium">
                {new Date(passport.last_activity_at).toLocaleDateString("fr-FR")}
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
