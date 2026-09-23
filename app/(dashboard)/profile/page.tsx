import { createClient } from "@/lib/supabase/server";
import { TrustPassportCard, type TrustPassport } from "@/components/profile/TrustPassportCard";
import { ROLE_LABELS, type UserRole } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, account_type, country, city, preferred_language_code")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const isEntreprise = profile.account_type === "entreprise";
  const isFreelance = profile.role === "freelance";

  const { data: company } = isEntreprise
    ? await supabase.from("companies").select("id, name").eq("user_id", user.id).single()
    : { data: null };

  const { data: passport } = company
    ? await supabase.from("company_trust_passport").select("*").eq("company_id", company.id).single()
    : { data: null };

  const { data: graphEdges } = company
    ? await supabase
        .from("business_graph_edges")
        .select(`id, relationship_type, corridor, transaction_count, last_transaction_at, company_a_id, company_b_id,
                 company_a:company_a_id ( name ), company_b:company_b_id ( name )`)
        .or(`company_a_id.eq.${company.id},company_b_id.eq.${company.id}`)
    : { data: null };

  const { data: freelancerProfile } = isFreelance
    ? await supabase
        .from("freelancer_profiles")
        .select("id, headline, bio, service_categories, hourly_rate, currency, is_identity_verified")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const { data: freelancerStats } = freelancerProfile
    ? await supabase
        .from("freelancer_reputation_stats")
        .select("*")
        .eq("freelancer_id", freelancerProfile.id)
        .single()
    : { data: null };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-ink">
          {company?.name ?? profile.full_name}
        </h1>
        <p className="font-sans text-sm text-ink/60 mt-1">
          {profile.role ? ROLE_LABELS[profile.role as UserRole] : "Profil"}
          {profile.city && profile.country && ` · ${profile.city}, ${profile.country}`}
        </p>
      </div>

      {isEntreprise && passport && <TrustPassportCard passport={passport as unknown as TrustPassport} />}

      {isEntreprise && graphEdges && graphEdges.length > 0 && (
        <div className="bg-white border border-line rounded-lg p-6">
          <h2 className="font-display text-lg text-ink mb-3">Relations commerciales (African Business Graph)</h2>
          <div className="flex flex-col gap-2">
            {graphEdges.map((edge: any) => {
              const otherName = edge.company_a_id === company!.id ? edge.company_b?.name : edge.company_a?.name;
              return (
                <div key={edge.id} className="flex items-center justify-between font-sans text-sm border-b border-line last:border-0 pb-2 last:pb-0">
                  <span className="text-ink">
                    {edge.relationship_type} · {otherName}
                    {edge.corridor && <span className="text-ink/40"> ({edge.corridor})</span>}
                  </span>
                  <span className="text-ink/50 text-xs">{edge.transaction_count} transaction(s)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isEntreprise && !passport && (
        <div className="bg-white border border-line rounded-lg p-6">
          <p className="font-sans text-sm text-ink/60">
            Votre passeport commercial apparaîtra ici une fois votre entreprise créée et vos
            premières vérifications soumises.
          </p>
        </div>
      )}

      {isFreelance && freelancerProfile && (
        <div className="bg-white border border-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg text-ink">
              {freelancerProfile.headline ?? "Profil freelance"}
            </h2>
            {freelancerProfile.is_identity_verified && (
              <span className="font-sans text-xs font-medium text-teal bg-teal/10 rounded-full px-3 py-1">
                ✓ Identité vérifiée
              </span>
            )}
          </div>
          {freelancerProfile.bio && (
            <p className="font-sans text-sm text-ink/70 mb-4">{freelancerProfile.bio}</p>
          )}
          {freelancerProfile.service_categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {freelancerProfile.service_categories.map((cat: string) => (
                <span
                  key={cat}
                  className="font-sans text-xs text-indigo bg-indigo/10 rounded-full px-2.5 py-1"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          {freelancerProfile.hourly_rate && (
            <p className="font-sans text-sm text-ink/60">
              {freelancerProfile.hourly_rate} {freelancerProfile.currency}/h
            </p>
          )}

          {freelancerStats && (
            <dl className="grid grid-cols-2 gap-y-2 font-sans text-sm mt-5 pt-4 border-t border-line">
              <dt className="text-ink/60">Missions réalisées</dt>
              <dd className="text-ink font-medium">{freelancerStats.total_missions}</dd>
              <dt className="text-ink/60">Missions complétées</dt>
              <dd className="text-ink font-medium">{freelancerStats.completed_missions}</dd>
              {freelancerStats.avg_rating != null && (
                <>
                  <dt className="text-ink/60">Note moyenne</dt>
                  <dd className="text-ink font-medium">{freelancerStats.avg_rating}/5</dd>
                </>
              )}
            </dl>
          )}
        </div>
      )}

      {!isEntreprise && !isFreelance && (
        <div className="bg-white border border-line rounded-lg p-6">
          <p className="font-sans text-sm text-ink/60">
            Complétez votre vérification pour débloquer la publication et la messagerie.
          </p>
        </div>
      )}
    </div>
  );
}
