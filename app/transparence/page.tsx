import { createClient } from "@/lib/supabase/server";

const METRIC_LABELS: Record<string, string> = {
  entreprises_inscrites: "Entreprises inscrites",
  entreprises_verifiees: "Entreprises vérifiées",
  demandes_commerciales: "Demandes commerciales",
  mises_en_relation: "Mises en relation",
  transactions_finalisees: "Transactions finalisées",
  corridors_actifs: "Corridors actifs",
  pays_connectes: "Pays connectés",
};

export default async function TransparencyPage() {
  const supabase = await createClient();

  // Recalcul à chaque visite — léger, pas besoin de cron pour ce volume
  await supabase.rpc("refresh_platform_metrics");

  const { data: metrics } = await supabase
    .from("platform_metrics")
    .select("metric_key, metric_value, computed_at")
    .order("computed_at", { ascending: false });

  // On ne garde que la valeur la plus récente par clé
  const latestByKey = new Map<string, { value: number; at: string }>();
  metrics?.forEach((m) => {
    if (!latestByKey.has(m.metric_key)) {
      latestByKey.set(m.metric_key, { value: m.metric_value, at: m.computed_at });
    }
  });

  return (
    <div className="min-h-screen bg-stone px-4 py-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Transparence OverLine Africa Hub</h1>
          <p className="font-sans text-sm text-ink/60 mt-1">
            Chiffres réels, calculés directement depuis la plateforme — jamais de chiffre marketing
            inventé.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from(latestByKey.entries()).map(([key, { value }]) => (
            <div key={key} className="bg-white border border-line rounded-lg p-5">
              <p className="font-display text-3xl text-indigo">{value}</p>
              <p className="font-sans text-xs text-ink/60 mt-1">{METRIC_LABELS[key] ?? key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
