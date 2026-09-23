import { createClient } from "@/lib/supabase/server";
import { NewServiceForm } from "@/components/services/NewServiceForm";

const PRICING_LABELS: Record<string, string> = {
  forfait: "Forfait",
  horaire: "Horaire",
  sur_devis: "Sur devis",
  abonnement: "Abonnement",
};

export default async function ServicesPage() {
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
        <h1 className="font-display text-2xl text-ink mb-2">Services</h1>
        <p className="font-sans text-sm text-ink/60">
          Le catalogue de services est réservé aux comptes entreprise (prestataires de service,
          fournisseurs proposant aussi du service, etc.). Un freelance gère plutôt son profil
          individuel dans "Profil".
        </p>
      </div>
    );
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, name, category, pricing_model, price, currency, description")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">Mes services</h1>

      <NewServiceForm companyId={company.id} />

      <div className="flex flex-col gap-2">
        {services?.map((s) => (
          <div key={s.id} className="bg-white border border-line rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-sans text-sm font-medium text-ink">{s.name}</p>
              <span className="font-sans text-xs text-indigo bg-indigo/10 rounded-full px-2.5 py-0.5">
                {s.category}
              </span>
            </div>
            {s.description && <p className="font-sans text-xs text-ink/60 mb-1">{s.description}</p>}
            <p className="font-sans text-xs text-ink/50">
              {PRICING_LABELS[s.pricing_model]}
              {s.price ? ` · ${s.price} ${s.currency}` : ""}
            </p>
          </div>
        ))}
        {(!services || services.length === 0) && (
          <p className="font-sans text-sm text-ink/50 text-center py-6">Aucun service publié.</p>
        )}
      </div>
    </div>
  );
}
