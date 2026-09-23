const FRANKFURTER_BASE = "https://api.frankfurter.dev/v2";

// Devises prioritaires identifiées pour la plateforme
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "XAF", "XOF", "NGN", "AOA", "CDF", "GHS", "KES", "ZAR", "EGP", "MAD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  USD: "Dollar américain",
  EUR: "Euro",
  XAF: "Franc CFA (CEMAC)",
  XOF: "Franc CFA (UEMOA)",
  NGN: "Naira nigérian",
  AOA: "Kwanza angolais",
  CDF: "Franc congolais",
  GHS: "Cedi ghanéen",
  KES: "Shilling kényan",
  ZAR: "Rand sud-africain",
  EGP: "Livre égyptienne",
  MAD: "Dirham marocain",
};

/**
 * Récupère les taux de change depuis une devise de base.
 * Mis en cache 6h côté Next.js (revalidate) — le taux de change n'a pas
 * besoin d'être vérifié à chaque affichage de prix, ça économise des
 * appels et accélère le rendu.
 */
export async function getExchangeRates(base: SupportedCurrency): Promise<Record<string, number>> {
  const symbols = SUPPORTED_CURRENCIES.filter((c) => c !== base).join(",");
  const res = await fetch(`${FRANKFURTER_BASE}/latest?base=${base}&symbols=${symbols}`, {
    next: { revalidate: 6 * 60 * 60 },
  });

  if (!res.ok) {
    throw new Error("Impossible de récupérer les taux de change");
  }

  const data = await res.json();
  return { [base]: 1, ...data.rates };
}

export async function convertAmount(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency
): Promise<number> {
  if (from === to) return amount;
  const rates = await getExchangeRates(from);
  const rate = rates[to];
  if (!rate) throw new Error(`Taux indisponible pour ${to}`);
  return Math.round(amount * rate * 100) / 100;
}
