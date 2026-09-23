"use client";

import { useEffect, useState } from "react";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency";

export function PriceWithConversion({
  amount,
  currency,
}: {
  amount: number;
  currency: SupportedCurrency;
}) {
  const [targetCurrency, setTargetCurrency] = useState<SupportedCurrency>(
    currency === "USD" ? "XAF" : "USD"
  );
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetCurrency === currency) {
      setConverted(amount);
      return;
    }

    setLoading(true);
    fetch(`/api/currency/convert?amount=${amount}&from=${currency}&to=${targetCurrency}`)
      .then((res) => res.json())
      .then((data) => setConverted(data.converted ?? null))
      .finally(() => setLoading(false));
  }, [amount, currency, targetCurrency]);

  return (
    <div className="flex items-center gap-2 font-sans text-sm">
      <span className="text-ink font-medium">
        {amount.toLocaleString("fr-FR")} {currency}
      </span>
      <span className="text-ink/40">≈</span>
      {loading ? (
        <span className="text-ink/40">…</span>
      ) : (
        <span className="text-ink/70">
          {converted?.toLocaleString("fr-FR")} {targetCurrency}
        </span>
      )}
      <select
        value={targetCurrency}
        onChange={(e) => setTargetCurrency(e.target.value as SupportedCurrency)}
        className="text-xs border border-line rounded px-1.5 py-0.5 bg-white"
      >
        {SUPPORTED_CURRENCIES.filter((c) => c !== currency).map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
