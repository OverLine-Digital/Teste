import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentReviewRow } from "@/components/admin/DocumentReviewRow";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/feed");

  const { data: pending } = await supabase
    .from("verifications")
    .select(
      `id, document_type, document_url, status, created_at,
       companies ( name, country ),
       profiles:user_id ( full_name )`
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl text-ink">Vérifications en attente</h1>
        <p className="font-sans text-sm text-ink/60 mt-1">
          Réservé aux fondateurs. Chaque approbation met à jour le passeport commercial du compte.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {pending?.map((v: any) => (
          <div key={v.id} className="bg-white border border-line rounded-lg p-5">
            <p className="font-sans text-sm font-semibold text-ink mb-3">
              {v.companies?.name ?? v.profiles?.full_name ?? "Compte inconnu"}
              {v.companies?.country && (
                <span className="font-normal text-ink/50"> · {v.companies.country}</span>
              )}
            </p>
            <DocumentReviewRow
              verificationId={v.id}
              documentType={v.document_type}
              documentUrl={v.document_url}
            />
          </div>
        ))}

        {(!pending || pending.length === 0) && (
          <p className="font-sans text-sm text-ink/50 text-center py-10">
            Aucune vérification en attente.
          </p>
        )}
      </div>
    </div>
  );
}
