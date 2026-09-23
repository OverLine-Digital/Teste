import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ROLE_LABELS, type UserRole } from "@/lib/types";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Vue publique limitée — jamais téléphone/email/OTP (voir migration
  // profile_language_badge)
  const { data: profile } = await supabase
    .from("profile_language_badge")
    .select("id, full_name, role, account_type, preferred_language_code, reception_languages")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: languages } = await supabase.from("languages").select("code, name_fr");
  const languageMap = new Map(languages?.map((l) => [l.code, l.name_fr]));

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select("headline, bio, service_categories, hourly_rate, currency, is_identity_verified")
    .eq("user_id", id)
    .single();

  const { data: freelancerStats } = freelancerProfile
    ? await supabase
        .from("freelancer_reputation_stats")
        .select("*")
        .eq("freelancer_id", (await supabase.from("freelancer_profiles").select("id").eq("user_id", id).single()).data?.id)
        .single()
    : { data: null };

  return (
    <div className="min-h-screen bg-stone px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">
            {freelancerProfile?.headline ?? profile.full_name}
          </h1>
          <p className="font-sans text-sm text-ink/60 mt-1">
            {profile.role ? ROLE_LABELS[profile.role as UserRole] : "Profil"}
            {" · "}
            {languageMap.get(profile.preferred_language_code) ?? profile.preferred_language_code}
          </p>
        </div>

        {freelancerProfile && (
          <div className="bg-white border border-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-sm font-medium text-ink">Profil freelance</span>
              {freelancerProfile.is_identity_verified && (
                <span className="font-sans text-xs font-medium text-teal bg-teal/10 rounded-full px-3 py-1">
                  ✓ Identité vérifiée
                </span>
              )}
            </div>
            {freelancerProfile.bio && <p className="font-sans text-sm text-ink/70 mb-3">{freelancerProfile.bio}</p>}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {freelancerProfile.service_categories?.map((cat: string) => (
                <span key={cat} className="font-sans text-xs text-indigo bg-indigo/10 rounded-full px-2.5 py-1">
                  {cat}
                </span>
              ))}
            </div>
            {freelancerProfile.hourly_rate && (
              <p className="font-sans text-sm text-ink/60">
                {freelancerProfile.hourly_rate} {freelancerProfile.currency}/h
              </p>
            )}
            {freelancerStats && (
              <dl className="grid grid-cols-2 gap-y-1 font-sans text-sm mt-4 pt-4 border-t border-line">
                <dt className="text-ink/60">Missions complétées</dt>
                <dd className="text-ink font-medium">{freelancerStats.completed_missions}</dd>
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
