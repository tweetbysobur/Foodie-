import { naira } from "@/lib/format";
import { cx } from "./ui";

export type SummaryTotals = { subtotal: number; deliveryFee: number; discount: number; total: number };

/** Reads like a receipt: label left, amount right, tabular figures, one total. */
export function Summary({
  totals,
  promoCode,
  vendorFees,
  className,
}: {
  totals: SummaryTotals;
  promoCode: string | null;
  vendorFees: { name: string; fee: number }[];
  className?: string;
}) {
  return (
    <dl className={cx("flex flex-col gap-2.5 border-t-2 border-ink/80 pt-4", className)}>
      <div className="t-body flex justify-between gap-4 text-[15px]">
        <dt className="text-muted-ink">Food subtotal</dt>
        <dd className="tabular text-ink">{naira(totals.subtotal)}</dd>
      </div>
      {vendorFees.map((v) => (
        <div key={v.name} className="t-body flex justify-between gap-4 text-[15px]">
          <dt className="min-w-0 truncate text-muted-ink">Delivery from {v.name}</dt>
          <dd className="tabular shrink-0 text-ink">{naira(v.fee)}</dd>
        </div>
      ))}
      {totals.discount > 0 && (
        <div className="t-body flex justify-between gap-4 text-[15px]">
          <dt className="text-green">Discount ({promoCode})</dt>
          <dd className="tabular font-medium text-green">-{naira(totals.discount)}</dd>
        </div>
      )}
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
        <dt className="t-card text-ink">Total</dt>
        <dd className="text-[28px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-ink">{naira(totals.total)}</dd>
      </div>
    </dl>
  );
}
