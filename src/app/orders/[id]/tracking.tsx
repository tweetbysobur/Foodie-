"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Bike, Check, ChefHat, CircleCheck, Info, MapPin, PackageCheck, Phone, ReceiptText, Store, X } from "lucide-react";
import { clockTime, naira, shortDate } from "@/lib/format";
import { DEMO_TRACKING, STATUS_STEPS, VENDORS_CONNECTED, canCancel, orderStatus } from "@/lib/order-status";
import { paymentLabel } from "@/lib/payments";
import { useNow, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { formatAddress } from "@/components/shell";
import { useReorder } from "@/components/reorder";
import { Button, Empty, FoodImage, PageHeader, Sheet, cx } from "@/components/ui";

const STEP_ICONS = [ReceiptText, Store, ChefHat, PackageCheck, Bike, CircleCheck];

export function Tracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const now = useNow(1000);
  const reorder = useReorder();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const order = state.orders.find((o) => o.id === id);

  if (!order)
    return (
      <main className="flex flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-10">
        <PageHeader title="Order" />
        <Empty title="Order not found" body="It may have been placed on another device." action={<Link href="/orders" className="t-button text-green">All orders</Link>} />
      </main>
    );

  const v = orderStatus(order, now);
  const eta: [number, number] = [order.placedAt + order.etaMinutes[0] * 60000, order.placedAt + order.etaMinutes[1] * 60000];
  const card = "flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft";

  return (
    <main className="pb-nav flex flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-10">
      <PageHeader title={`Order ${order.reference}`} subtitle={`Placed ${shortDate(order.placedAt)}`} />

      <div className="flex flex-col gap-5 md:grid md:grid-cols-[1.1fr_1fr] md:items-start md:gap-10">
        <section aria-labelledby="status-h" className={cx("flex flex-col gap-5 rounded-[24px] p-6", v.kind === "cancelled" ? "bg-surface shadow-soft" : "bg-green text-white shadow-float")}>
          <div>
            <p className={cx("t-support", v.kind === "cancelled" ? "text-muted-ink" : "text-white/80")}>
              {v.kind === "cancelled" ? `Cancelled ${shortDate(order.cancelledAt!)}` : v.kind === "delivered" ? "Delivered" : "Estimated arrival"}
            </p>
            <h2 id="status-h" className={cx("t-display tabular", v.kind === "cancelled" ? "text-ink" : "text-white")}>
              {v.kind === "cancelled" ? "Order cancelled" : v.kind === "delivered" ? "Enjoy your meal" : `${clockTime(eta[0])} - ${clockTime(eta[1])}`}
            </h2>
            {v.kind === "active" && <p className="t-body mt-1 text-white/90">{v.step.detail}</p>}
          </div>

          {v.kind !== "cancelled" && (
            <ol className="flex flex-col rounded-[var(--radius-card)] bg-surface p-4 text-ink" aria-label="Order progress">
              {STATUS_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i];
                const done = i < v.index || v.kind === "delivered";
                const current = i === v.index && v.kind === "active";
                return (
                  <li key={step.id} aria-current={current ? "step" : undefined} className="relative flex min-h-[54px] items-start gap-3.5">
                    {i < STATUS_STEPS.length - 1 && <span aria-hidden className={cx("absolute left-[17px] top-9 h-[calc(100%-28px)] w-0.5 rounded-full", done ? "bg-green" : "bg-line")} />}
                    <span
                      className={cx(
                        "relative z-10 grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                        done ? "bg-green text-white" : current ? "bg-orange-strong text-white ring-4 ring-peach" : "bg-cream text-muted",
                      )}
                    >
                      {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <Icon className="size-4" aria-hidden />}
                    </span>
                    <span className="pt-1.5">
                      <span className={cx("block text-[15px]", current ? "font-bold text-ink" : done ? "font-semibold text-ink" : "font-medium text-muted-ink")}>{step.label}</span>
                      <span className="sr-only">{done ? "Completed" : current ? "In progress" : "Upcoming"}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {v.kind === "cancelled" && <p className="t-body text-muted-ink">You cancelled this order before the vendor confirmed it. You were not charged.</p>}

          {v.kind === "active" && !DEMO_TRACKING && (
            <p className="t-support flex gap-2 text-white/90">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {VENDORS_CONNECTED ? "Live updates appear here as the vendor and rider progress." : "Live tracking starts once vendors are connected to Foodie. This order stays at its first step until then."}
            </p>
          )}
          {DEMO_TRACKING && v.kind !== "cancelled" && (
            <p className="t-support flex gap-2 text-white/90">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Demo mode: status moves on a timer, not from a real vendor.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className={card} aria-labelledby="items-h">
            <h2 id="items-h" className="t-section text-[18px] text-ink">
              Your food
            </h2>
            <ul className="flex flex-col gap-3">
              {order.lines.map((l, i) => {
                const item = catalog.items.get(l.itemId);
                return (
                  <li key={i} className="flex items-center gap-3">
                    {item && <FoodImage photo={item.photo} sizes="56px" className="size-14 shrink-0 rounded-[14px]" />}
                    <span className="min-w-0 flex-1">
                      <span className="t-card block truncate text-[15px] text-ink">
                        {l.qty}x {l.name}
                      </span>
                      <span className="t-support block truncate text-muted-ink">
                        {catalog.vendors.get(l.vendorId)?.name}
                        {l.optionLabels.length ? ` · ${l.optionLabels.join(", ")}` : ""}
                      </span>
                    </span>
                    <span className="t-body tabular text-[15px] text-ink">{naira(l.unitPrice * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="flex flex-col gap-2 border-t border-line pt-3.5">
              {(
                [
                  ["Food subtotal", naira(order.subtotal)],
                  ["Delivery", naira(order.deliveryFee)],
                  ...(order.discount ? [[`Discount (${order.promoCode})`, `-${naira(order.discount)}`]] : []),
                ] as [string, string][]
              ).map(([k, val]) => (
                <div key={k} className="t-body flex justify-between text-[15px]">
                  <dt className="text-muted-ink">{k}</dt>
                  <dd className="tabular text-ink">{val}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between pt-1">
                <dt className="t-card text-ink">{v.kind === "cancelled" ? "Total (not charged)" : "Total, pay on delivery"}</dt>
                <dd className="t-price text-[20px] text-ink">{naira(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className={card} aria-labelledby="del-h">
            <h2 id="del-h" className="t-section text-[18px] text-ink">
              Delivery
            </h2>
            <ul className="flex flex-col gap-3.5">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-orange-strong" aria-hidden />
                <span className="t-body text-[15px] text-ink">
                  {formatAddress(order.address)}
                  {order.contact.instructions && <span className="t-support block text-muted-ink">{order.contact.instructions}</span>}
                </span>
              </li>
              <li className="flex gap-3">
                <Store className="mt-0.5 size-5 shrink-0 text-green" aria-hidden />
                <span className="t-body text-[15px] text-ink">{order.vendorIds.map((vid) => catalog.vendors.get(vid)?.name).join(", ")}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-green" aria-hidden />
                <span className="t-body text-[15px] text-ink">
                  {order.contact.name}, {order.contact.phone} · {paymentLabel(order.paymentMethod)}
                </span>
              </li>
            </ul>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => reorder(order)}>
              Order again
            </Button>
            {canCancel(v) && (
              <Button variant="danger" size="lg" className="flex-1" onClick={() => setConfirmCancel(true)}>
                <X className="size-4" /> Cancel order
              </Button>
            )}
          </div>
        </div>
      </div>

      {confirmCancel && (
        <Sheet
          title="Cancel this order?"
          onClose={() => setConfirmCancel(false)}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmCancel(false)}>
                Keep order
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  dispatch({ type: "cancelOrder", id: order.id });
                  setConfirmCancel(false);
                  toast(`Order ${order.reference} cancelled`);
                }}
              >
                Cancel order
              </Button>
            </div>
          }
        >
          <p className="t-body text-[15px] text-muted-ink">You can cancel until the vendor confirms. Nothing has been charged.</p>
        </Sheet>
      )}
    </main>
  );
}
