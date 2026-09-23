import { createClient } from "@/lib/supabase/server";
import { NewProductForm } from "@/components/products/NewProductForm";
import { PriceWithConversion } from "@/components/ui/PriceWithConversion";
import type { SupportedCurrency } from "@/lib/currency";

export default async function ProductsPage() {
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
        <h1 className="font-display text-2xl text-ink mb-2">Produits</h1>
        <p className="font-sans text-sm text-ink/60">
          Le catalogue produits est réservé aux comptes entreprise. Un catalogue de services est
          disponible pour les prestataires — voir "Services" dans le menu.
        </p>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, price, currency, min_order_quantity, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">Mes produits</h1>

      <NewProductForm companyId={company.id} />

      <div className="flex flex-col gap-2">
        {products?.map((p) => (
          <div key={p.id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-sans text-sm font-medium text-ink">{p.name}</p>
              <p className="font-sans text-xs text-ink/50">{p.category ?? "Sans catégorie"}</p>
            </div>
            {p.price && (
              <PriceWithConversion amount={p.price} currency={(p.currency as SupportedCurrency) ?? "USD"} />
            )}
          </div>
        ))}
        {(!products || products.length === 0) && (
          <p className="font-sans text-sm text-ink/50 text-center py-6">Aucun produit publié.</p>
        )}
      </div>
    </div>
  );
}
