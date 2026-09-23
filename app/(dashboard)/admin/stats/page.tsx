import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/feed");

  await supabase.rpc("refresh_platform_metrics");

  const { data: metrics } = await supabase
    .from("platform_metrics")
    .select("metric_key, metric_value, computed_at")
    .order("computed_at", { ascending: false });

  const latest = new Map<string, number>();
  metrics?.forEach((m) => {
    if (!latest.has(m.metric_key)) latest.set(m.metric_key, m.metric_value);
  });

  // Répartition par secteur (analytics avancé)
  const { data: companies } = await supabase.from("companies").select("sectors, country, verification_status");
  const bySector = new Map<string, number>();
  const byCountry = new Map<string, number>();
  companies?.forEach((c) => {
    c.sectors?.forEach((s: string) => bySector.set(s, (bySector.get(s) ?? 0) + 1));
    if (c.country) byCountry.set(c.country, (byCountry.get(c.country) ?? 0) + 1);
  });

  // Entonnoir de conversion
  const totalCompanies = companies?.length ?? 0;
  const verifiedCompanies = companies?.filter((c) => c.verification_status === "verified").length ?? 0;
  const { count: companiesWithTransactions } = await supabase
    .from("reputation_stats")
    .select("company_id", { count: "exact", head: true })
    .gt("total_transactions", 0);

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <h1 className="font-display text-2xl text-ink">Statistiques — Fondateurs</h1>

      <section>
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide mb-3">
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from(latest.entries()).map(([key, value]) => (
            <div key={key} className="bg-white border border-line rounded-lg p-4">
              <p className="font-display text-2xl text-indigo">{value}</p>
              <p className="font-sans text-xs text-ink/50 mt-0.5">{key.replace(/_/g, " ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide mb-4">
          Entonnoir de conversion
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { label: "Entreprises inscrites", value: totalCompanies },
            { label: "Vérifiées", value: verifiedCompanies },
            { label: "Avec au moins une transaction", value: companiesWithTransactions ?? 0 },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className="h-8 bg-indigo/80 rounded flex items-center px-3 font-sans text-xs text-stone"
                style={{ width: `${totalCompanies > 0 ? Math.max(10, (step.value / totalCompanies) * 100) : 0}%` }}
              >
                {step.value}
              </div>
              <span className="font-sans text-xs text-ink/60">{step.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide mb-4">
          Répartition par secteur
        </h2>
        <div className="flex flex-col gap-2">
          {Array.from(bySector.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([sector, count]) => (
              <div key={sector} className="flex justify-between font-sans text-sm">
                <span className="text-ink">{sector}</span>
                <span className="text-ink/60">{count}</span>
              </div>
            ))}
        </div>
      </section>

      <section className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide mb-4">
          Répartition par pays
        </h2>
        <div className="flex flex-col gap-2">
          {Array.from(byCountry.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([country, count]) => (
              <div key={country} className="flex justify-between font-sans text-sm">
                <span className="text-ink">{country}</span>
                <span className="text-ink/60">{count}</span>
              </div>
            ))}
        </div>
      </section>

      <p className="font-sans text-xs text-ink/40">
        Revenus non calculés ici — aucun système de paiement/commission n'est encore implémenté dans
        le code (voir Frankfurter, Flutterwave/Paystack en attente).
      </p>
    </div>
  );
}
