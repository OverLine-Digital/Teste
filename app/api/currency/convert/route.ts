import { NextRequest, NextResponse } from "next/server";
import { convertAmount, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const amount = Number(searchParams.get("amount"));
  const from = searchParams.get("from") as SupportedCurrency;
  const to = searchParams.get("to") as SupportedCurrency;

  if (!amount || !SUPPORTED_CURRENCIES.includes(from) || !SUPPORTED_CURRENCIES.includes(to)) {
    return NextResponse.json({ error: "Paramètres invalides (amount, from, to)" }, { status: 400 });
  }

  try {
    const converted = await convertAmount(amount, from, to);
    return NextResponse.json({ amount, from, to, converted });
  } catch {
    return NextResponse.json({ error: "Conversion impossible" }, { status: 502 });
  }
}
