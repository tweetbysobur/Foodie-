import { naira } from "@/lib/format";

type Totals = { subtotal: number; deliveryFee: number; discount: number; total: number; vendorIds: string[] };

/** Reads like a receipt: label left, amount right, tabular figures. */
export function Summary({ totals, promoCode }: { totals: Totals; promoCode: string | null }) {
  const rows: [string, string][] = [
    ["Subtotal", naira(totals.subtotal)],
    [totals.vendorIds.length > 1 ? `Delivery (${totals.vendorIds.length} vendors)` : "Delivery", naira(totals.deliveryFee)],
  ];
  if (totals.discount > 0) rows.push([`Discount (${promoCode})`, `-${naira(totals.discount)}`]);
  return (
    <dl className="flex flex-col gap-2.5 rounded-[var(--radius-card)] bg-surface p-5 text-[15px] shadow-soft">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <dt className="text-muted-ink">{k}</dt>
          <dd className="tabular text-ink">{v}</dd>
        </div>
      ))}
      <div className="mt-1 flex justify-between gap-4 border-t border-line pt-3 text-[18px] font-bold text-ink">
        <dt>Total</dt>
        <dd className="tabular">{naira(totals.total)}</dd>
      </div>
    </dl>
  );
}
