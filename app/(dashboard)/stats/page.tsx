import { createClient } from "@/lib/supabase/server";

function Bar({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between font-sans text-xs text-ink/60">
        <span>{label}</span>
        <span className="font-medium text-ink">{value.toLocaleString("fr-FR")}{suffix}</span>
      </div>
      <div className="h-2 bg-stone-dim rounded-full overflow-hidden">
        <div className="h-full bg-indigo rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("id, sectors, country")
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl text-ink mb-2">Statistiques</h1>
        <p className="font-sans text-sm text-ink/60">Réservé aux comptes entreprise pour l'instant.</p>
      </div>
    );
  }

  const { data: myStats } = await supabase
    .from("reputation_stats")
    .select("*")
    .eq("company_id", company.id)
    .single();

  const { count: myProductsCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  const { count: myPostsCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  // Benchmark secteur : moyenne des entreprises partageant au moins un secteur
  const primarySector = company.sectors?.[0];
  let sectorAvgResponse: number | null = null;
  let sectorCompanyCount = 0;

  if (primarySector) {
    const { data: sectorCompanies } = await supabase
      .from("companies")
      .select("id")
      .contains("sectors", [primarySector]);

    const sectorCompanyIds = sectorCompanies?.map((c) => c.id) ?? [];
    sectorCompanyCount = sectorCompanyIds.length;

    if (sectorCompanyIds.length > 0) {
      const { data: sectorStats } = await supabase
        .from("reputation_stats")
        .select("avg_response_time_hours")
        .in("company_id", sectorCompanyIds)
        .not("avg_response_time_hours", "is", null);

      const values = sectorStats?.map((s) => s.avg_response_time_hours) ?? [];
      if (values.length > 0) {
        sectorAvgResponse = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h1 className="font-display text-2xl text-ink">Statistiques</h1>

      <section className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide mb-4">
          Mon activité
        </h2>
        <div className="flex flex-col gap-4">
          <Bar label="Transactions réalisées" value={myStats?.total_transactions ?? 0} max={Math.max(10, myStats?.total_transactions ?? 0)} />
          <Bar label="Produits publiés" value={myProductsCount ?? 0} max={Math.max(10, myProductsCount ?? 0)} />
          <Bar label="Publications" value={myPostsCount ?? 0} max={Math.max(10, myPostsCount ?? 0)} />
          {myStats?.avg_response_time_hours != null && (
            <p className="font-sans text-sm text-ink/60">
              Répond généralement en <span className="font-medium text-ink">{Math.round(myStats.avg_response_time_hours)} h</span>
            </p>
          )}
        </div>
      </section>

      {primarySector && (
        <section className="bg-white border border-line rounded-lg p-6">
          <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide mb-4">
            Mon secteur — {primarySector}
          </h2>
          <p className="font-sans text-sm text-ink/60 mb-3">
            {sectorCompanyCount} entreprise(s) dans ce secteur sur la plateforme.
          </p>
          {sectorAvgResponse != null && myStats?.avg_response_time_hours != null ? (
            <div className="flex flex-col gap-3">
              <Bar label="Votre temps de réponse" value={Math.round(myStats.avg_response_time_hours)} max={Math.max(myStats.avg_response_time_hours, sectorAvgResponse) * 1.2} suffix=" h" />
              <Bar label="Moyenne du secteur" value={Math.round(sectorAvgResponse)} max={Math.max(myStats.avg_response_time_hours, sectorAvgResponse) * 1.2} suffix=" h" />
            </div>
          ) : (
            <p className="font-sans text-xs text-ink/40">Pas encore assez de données pour comparer.</p>
          )}
        </section>
      )}
    </div>
  );
}
