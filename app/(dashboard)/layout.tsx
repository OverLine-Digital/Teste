import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { VerificationBanner } from "@/components/layout/VerificationBanner";
import { NotificationBell } from "@/components/layout/NotificationBell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, onboarding_step, is_admin")
    .eq("id", user.id)
    .single();

  const { data: company } = await supabase
    .from("companies")
    .select("verification_status")
    .eq("user_id", user.id)
    .single();

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select("is_identity_verified")
    .eq("user_id", user.id)
    .single();

  const isVerified =
    company?.verification_status === "verified" || freelancerProfile?.is_identity_verified === true;

  return (
    <div className="flex min-h-screen bg-stone">
      <Sidebar fullName={profile?.full_name ?? ""} role={profile?.role ?? null} isAdmin={profile?.is_admin ?? false} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-end px-6 py-3 border-b border-line bg-white">
          <NotificationBell userId={user.id} />
        </div>
        {!isVerified && <VerificationBanner />}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
