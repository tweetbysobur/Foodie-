import { naira } from "@/lib/format";
import { cx } from "./ui";

export type SummaryTotals = { subtotal: number; deliveryFee: number; discount: number; total: number };

function Line({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className={cx("flex items-baseline gap-2 text-[15px]", tone === "green" ? "text-green" : "text-ink")}>
      <dt className="min-w-0 truncate">{label}</dt>
      <span aria-hidden className="leader" />
      <dd className="tabular shrink-0 font-medium">{value}</dd>
    </div>
  );
}

/** A printed receipt: leaders to every amount, one big total. */
export function Summary({ totals, promoCode, vendorFees, className }: { totals: SummaryTotals; promoCode: string | null; vendorFees: { name: string; fee: number }[]; className?: string }) {
  return (
    <dl className={cx("flex flex-col gap-2.5", className)}>
      <Line label="Food" value={naira(totals.subtotal)} />
      {vendorFees.map((v) => (
        <Line key={v.name} label={`Delivery, ${v.name}`} value={naira(v.fee)} />
      ))}
      {totals.discount > 0 && <Line label={`${promoCode}, 10% off`} value={`-${naira(totals.discount)}`} tone="green" />}
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
        <dt className="t-card text-ink">Total</dt>
        <dd className="font-[family-name:var(--font-display)] text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-ink">{naira(totals.total)}</dd>
      </div>
    </dl>
  );
}
