"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Check } from "lucide-react";
import { clockTime, naira, shortDate } from "@/lib/format";
import { DEMO_TRACKING, STATUS_STEPS, VENDORS_CONNECTED, canCancel, orderStatus } from "@/lib/order-status";
import { paymentLabel } from "@/lib/payments";
import { useNow, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { formatAddress } from "@/components/shell";
import { useReorder } from "@/components/reorder";
import { BoardHeading, Button, Empty, PageHeader, Sheet, cx } from "@/components/ui";

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
      <main className="px-5 pt-[calc(env(safe-area-inset-top)+12px)] md:px-0 md:pt-8">
        <PageHeader title="Order" />
        <Empty title="Order not found." body="It may have been placed on another device." action={<Link href="/orders" className="t-button text-green underline">All orders</Link>} />
      </main>
    );

  const v = orderStatus(order, now);
  const eta: [number, number] = [order.placedAt + order.etaMinutes[0] * 60000, order.placedAt + order.etaMinutes[1] * 60000];
  const receipt: [string, string, ("green" | undefined)?][] = [
    ["Food", naira(order.subtotal)],
    ["Delivery", naira(order.deliveryFee)],
    ...(order.discount ? ([[`${order.promoCode}, 10% off`, `-${naira(order.discount)}`, "green"]] as [string, string, "green"][]) : []),
  ];

  return (
    <main className="pb-nav px-5 pt-[calc(env(safe-area-inset-top)+12px)] md:px-0 md:pt-8">
      <PageHeader title={`Order ${order.reference}`} subtitle={`Placed ${shortDate(order.placedAt)}`} />

      <div className="mt-6 flex flex-col gap-10 md:grid md:grid-cols-[1.1fr_1fr] md:items-start md:gap-14">
        <div className="flex flex-col gap-6">
          {/* The answer first: when */}
          <section aria-labelledby="status-h" className={cx("rounded-[6px] p-5", v.kind === "cancelled" ? "ring-[1.5px] ring-inset ring-danger/60" : "bg-green text-cream")}>
            <p className={cx("text-[15px] font-semibold", v.kind === "cancelled" ? "text-danger" : "text-cream/85")}>
              {v.kind === "cancelled" ? `Cancelled ${shortDate(order.cancelledAt!)}` : v.kind === "delivered" ? "Delivered" : "Arriving between"}
            </p>
            <h2 id="status-h" className={cx("mt-1 font-[family-name:var(--font-display)] text-[48px] font-extrabold leading-none tracking-[-0.04em] tabular-nums", v.kind === "cancelled" ? "text-ink" : "text-cream")}>
              {v.kind === "cancelled" ? "Cancelled." : v.kind === "delivered" ? "Enjoy." : `${clockTime(eta[0])}-${clockTime(eta[1])}`}
            </h2>
            {v.kind === "cancelled" && <p className="t-body mt-2 text-muted-ink">You cancelled before the kitchen confirmed. You were not charged.</p>}
          </section>

          {v.kind !== "cancelled" && (
            <ol aria-label="Order progress">
              {STATUS_STEPS.map((step, i) => {
                const done = i < v.index || v.kind === "delivered";
                const current = i === v.index && v.kind === "active";
                return (
                  <li key={step.id} aria-current={current ? "step" : undefined} className="flex items-start gap-4 border-b border-dashed border-leader py-3.5">
                    <span
                      className={cx(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                        done ? "bg-green text-white" : current ? "bg-burnt ring-[5px] ring-burnt/20" : "ring-[1.5px] ring-inset ring-ink/30",
                      )}
                    >
                      {done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cx("block font-[family-name:var(--font-display)] tracking-[-0.01em]", current ? "text-[20px] font-extrabold text-ink" : done ? "text-[17px] font-bold text-ink" : "text-[17px] font-semibold text-muted-ink")}>
                        {step.label}
                      </span>
                      {current && <span className="t-support block text-muted-ink">{step.detail}</span>}
                      <span className="sr-only">{done ? "Completed" : current ? "In progress" : "Upcoming"}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {v.kind === "active" && !DEMO_TRACKING && (
            <p className="t-support border-l-[3px] border-burnt pl-3 text-ink">
              {VENDORS_CONNECTED ? "Live updates appear here as the kitchen and rider progress." : "Live tracking starts once kitchens are connected to Foodie. Until then this order stays at its first step."}
            </p>
          )}
          {DEMO_TRACKING && v.kind !== "cancelled" && <p className="t-support border-l-[3px] border-burnt pl-3 text-ink">Demo mode: status moves on a timer, not from a real kitchen.</p>}
        </div>

        <div className="flex flex-col gap-10">
          <section aria-labelledby="items-h">
            <BoardHeading id="items-h">Your food</BoardHeading>
            <ul>
              {order.lines.map((l, i) => (
                <li key={i} className="border-b border-dashed border-leader py-3">
                  <span className="flex items-baseline gap-2 text-[16px] text-ink">
                    <span className="min-w-0 truncate font-semibold">
                      {l.qty}x {l.name}
                    </span>
                    <span aria-hidden className="leader" />
                    <span className="tabular shrink-0">{naira(l.unitPrice * l.qty)}</span>
                  </span>
                  <span className="t-support block truncate text-muted-ink">
                    {catalog.vendors.get(l.vendorId)?.name}
                    {l.optionLabels.length ? ` · ${l.optionLabels.join(", ")}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 flex flex-col gap-2">
              {receipt.map(([k, val, tone]) => (
                <div key={k} className={cx("flex items-baseline gap-2 text-[15px]", tone === "green" ? "text-green" : "text-ink")}>
                  <dt>{k}</dt>
                  <span aria-hidden className="leader" />
                  <dd className="tabular">{val}</dd>
                </div>
              ))}
              <div className="mt-1 flex items-baseline justify-between border-t-2 border-ink pt-3">
                <dt className="t-card text-ink">{v.kind === "cancelled" ? "Total (not charged)" : "Pay on delivery"}</dt>
                <dd className="font-[family-name:var(--font-display)] text-[30px] font-extrabold tracking-[-0.03em] tabular-nums text-ink">{naira(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="del-h">
            <BoardHeading id="del-h">Delivery</BoardHeading>
            <dl className="text-[15px]">
              {(
                [
                  ["To", formatAddress(order.address) + (order.contact.instructions ? `. ${order.contact.instructions}` : "")],
                  ["From", order.vendorIds.map((vid) => catalog.vendors.get(vid)?.name).join(", ")],
                  ["Contact", `${order.contact.name}, ${order.contact.phone}`],
                  ["Payment", paymentLabel(order.paymentMethod)],
                ] as [string, string][]
              ).map(([k, val]) => (
                <div key={k} className="flex gap-4 border-b border-line py-3">
                  <dt className="w-20 shrink-0 text-muted-ink">{k}</dt>
                  <dd className="min-w-0 text-ink">{val}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => reorder(order)}>
              Order again
            </Button>
            {canCancel(v) && (
              <Button variant="danger" size="lg" className="flex-1" onClick={() => setConfirmCancel(true)}>
                Cancel order
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
          <p className="t-body text-[15px] text-muted-ink">You can cancel until the kitchen confirms. Nothing has been charged.</p>
        </Sheet>
      )}
    </main>
  );
}
