import { createClient } from "@/lib/supabase/server";
import { NewPartnerRequestForm } from "@/components/partners/NewPartnerRequestForm";

const PARTNER_TYPE_LABELS: Record<string, string> = {
  distributeur: "Distributeur",
  representant_commercial: "Représentant commercial",
  agence_marketing: "Agence marketing",
  partenaire_implantation: "Partenaire d'implantation",
  grossiste: "Grossiste",
  importateur: "Importateur",
  commercial: "Commercial",
  transporteur: "Transporteur",
  entrepot: "Entrepôt",
  representant_local: "Représentant local",
  autre: "Autre",
};

export default async function PartnersPage() {
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

  const { data: requests } = await supabase
    .from("business_partner_requests")
    .select(`id, partner_type, target_country, description, status, created_at, companies ( name )`)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-ink">Find a Business Partner</h1>
        <p className="font-sans text-sm text-ink/60 mt-1">
          Au-delà du produit — trouvez un distributeur, un représentant, une agence, un partenaire
          d'implantation.
        </p>
      </div>

      {company && <NewPartnerRequestForm companyId={company.id} />}

      <div className="flex flex-col gap-2">
        {requests?.map((r: any) => (
          <div key={r.id} className="bg-white border border-line rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-sm font-medium text-ink">{r.companies?.name}</span>
              <span className="font-sans text-xs text-indigo bg-indigo/10 rounded-full px-2.5 py-0.5">
                {PARTNER_TYPE_LABELS[r.partner_type] ?? r.partner_type}
              </span>
            </div>
            <p className="font-sans text-xs text-ink/50 mb-1">{r.target_country}</p>
            {r.description && <p className="font-sans text-sm text-ink/70">{r.description}</p>}
          </div>
        ))}
        {(!requests || requests.length === 0) && (
          <p className="font-sans text-sm text-ink/50 text-center py-6">Aucune demande en ce moment.</p>
        )}
      </div>
    </div>
  );
}
