import { createClient } from "@/lib/supabase/server";
import { NewCapacityForm } from "@/components/logistics/NewCapacityForm";
import { NewLogisticsRequestForm } from "@/components/logistics/NewLogisticsRequestForm";
import { MatchActions } from "@/components/logistics/MatchActions";

export default async function LogisticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl text-ink mb-2">Logistics Match</h1>
        <p className="font-sans text-sm text-ink/60">Réservé aux comptes entreprise.</p>
      </div>
    );
  }

  const { data: myCapacities } = await supabase
    .from("capacities")
    .select("id, type, origin_country, origin_city, destination_country, destination_city, quantity, unit, status")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const { data: receivedProposals } = await supabase
    .from("logistics_matches")
    .select(
      `id, match_score, status, logistics_requests ( origin_city, origin_country, destination_city, destination_country, weight_kg, companies ( name ) )`
    )
    .in("capacity_id", (myCapacities ?? []).map((c) => c.id))
    .eq("status", "propose");

  const { data: myRequests } = await supabase
    .from("logistics_requests")
    .select(
      `id, origin_country, origin_city, destination_country, destination_city, weight_kg, status, created_at,
       logistics_matches ( id, match_score, status, capacities ( origin_city, destination_city, companies ( name ) ) )`
    )
    .eq("requester_company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-ink">Logistics Match</h1>
        <p className="font-sans text-sm text-ink/60 mt-1">
          Déclarez une capacité de transport disponible, ou trouvez un transporteur pour votre
          marchandise — le rapprochement se fait automatiquement.
        </p>
      </div>

      {receivedProposals && receivedProposals.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide">
            Propositions reçues pour mes capacités
          </h2>
          <div className="flex flex-col gap-2">
            {receivedProposals.map((m: any) => (
              <div key={m.id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-ink">
                    {m.logistics_requests?.companies?.name} — {m.logistics_requests?.origin_city ?? m.logistics_requests?.origin_country} →{" "}
                    {m.logistics_requests?.destination_city ?? m.logistics_requests?.destination_country}
                  </p>
                  <p className="font-sans text-xs text-ink/50">
                    {m.logistics_requests?.weight_kg} kg · Score {m.match_score}%
                  </p>
                </div>
                <MatchActions matchId={m.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide">
          Mes capacités de transport
        </h2>
        <NewCapacityForm companyId={company.id} />
        <div className="flex flex-col gap-2">
          {myCapacities?.map((c) => (
            <div key={c.id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-sans text-sm text-ink">
                  {c.type} · {c.origin_city ?? c.origin_country}
                  {c.destination_city && ` → ${c.destination_city}`}
                </p>
                {c.quantity && (
                  <p className="font-sans text-xs text-ink/50">
                    {c.quantity} {c.unit}
                  </p>
                )}
              </div>
              <span className="font-sans text-xs text-teal bg-teal/10 rounded-full px-2.5 py-1">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-sans text-sm font-semibold text-ink/70 uppercase tracking-wide">
          Mes demandes de transport
        </h2>
        <NewLogisticsRequestForm companyId={company.id} />
        <div className="flex flex-col gap-2">
          {myRequests?.map((r: any) => (
            <div key={r.id} className="bg-white border border-line rounded-lg p-4">
              <p className="font-sans text-sm text-ink mb-2">
                {r.origin_city ?? r.origin_country} → {r.destination_city ?? r.destination_country}
                {r.weight_kg && <span className="text-ink/50"> · {r.weight_kg} kg</span>}
              </p>
              {r.logistics_matches?.length > 0 ? (
                <div className="flex flex-col gap-1.5 border-t border-line pt-2">
                  {r.logistics_matches.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between font-sans text-xs">
                      <span className="text-ink/70">
                        {m.capacities?.companies?.name ?? "Transporteur"} — {m.capacities?.origin_city} →{" "}
                        {m.capacities?.destination_city}
                      </span>
                      <span className="text-indigo font-medium">{m.match_score}% · {m.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-xs text-ink/40">Aucun transporteur trouvé pour l'instant.</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
