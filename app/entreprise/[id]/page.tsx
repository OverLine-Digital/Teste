import { createClient } from "@/lib/supabase/server";
import { TrustPassportCard, type TrustPassport } from "@/components/profile/TrustPassportCard";
import { notFound } from "next/navigation";

export default async function PublicCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, country, sectors, description")
    .eq("id", id)
    .single();

  if (!company) notFound();

  const { data: passport } = await supabase
    .from("company_trust_passport")
    .select("*")
    .eq("company_id", id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, price, currency")
    .eq("company_id", id)
    .limit(20);

  const { data: services } = await supabase
    .from("services")
    .select("id, name, category, pricing_model, price, currency")
    .eq("company_id", id)
    .limit(20);

  return (
    <div className="min-h-screen bg-stone px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">{company.name}</h1>
          <p className="font-sans text-sm text-ink/60 mt-1">
            {company.country} {company.sectors?.length > 0 && `· ${company.sectors.join(", ")}`}
          </p>
          {company.description && (
            <p className="font-sans text-sm text-ink/70 mt-3">{company.description}</p>
          )}
        </div>

        {passport && <TrustPassportCard passport={passport as unknown as TrustPassport} />}

        {products && products.length > 0 && (
          <div className="bg-white border border-line rounded-lg p-5">
            <h2 className="font-display text-lg text-ink mb-3">Produits</h2>
            <div className="flex flex-col gap-2">
              {products.map((p) => (
                <div key={p.id} className="flex justify-between font-sans text-sm">
                  <span className="text-ink">{p.name}</span>
                  {p.price && <span className="text-ink/60">{p.price} {p.currency}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {services && services.length > 0 && (
          <div className="bg-white border border-line rounded-lg p-5">
            <h2 className="font-display text-lg text-ink mb-3">Services</h2>
            <div className="flex flex-col gap-2">
              {services.map((s) => (
                <div key={s.id} className="flex justify-between font-sans text-sm">
                  <span className="text-ink">{s.name}</span>
                  <span className="text-ink/60">{s.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
