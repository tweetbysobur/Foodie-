/** Promo codes. Move to a promo_codes table when the backend lands. */
type Promo = { code: string; percent: number; firstOrderOnly: boolean; maxDiscount: number };

export const PROMOS: Promo[] = [
  { code: "TEGA10", percent: 10, firstOrderOnly: true, maxDiscount: 5000 },
  { code: "GENTLE", percent: 10, firstOrderOnly: true, maxDiscount: 5000 },
];

export const BANNER_CODE = "TEGA10";

export type PromoResult = { ok: true; promo: Promo } | { ok: false; error: string };

export function checkPromo(raw: string, pastOrders: number): PromoResult {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a promo code." };
  const promo = PROMOS.find((p) => p.code === code);
  if (!promo) return { ok: false, error: `${code} is not a valid code.` };
  if (promo.firstOrderOnly && pastOrders > 0) return { ok: false, error: `${code} works on your first order only.` };
  return { ok: true, promo };
}

export function promoDiscount(code: string | null, subtotal: number, pastOrders: number) {
  if (!code) return 0;
  const r = checkPromo(code, pastOrders);
  if (!r.ok) return 0;
  return Math.min(Math.round((subtotal * r.promo.percent) / 100), r.promo.maxDiscount);
}
