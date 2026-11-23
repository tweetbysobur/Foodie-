"use client";

import Link from "next/link";
import { use } from "react";
import { Bike, Check, ChefHat, CircleCheck, MapPin, PackageCheck, ReceiptText, Store } from "lucide-react";
import { clockTime, naira, shortDate } from "@/lib/format";
import { IS_DEMO_TRACKING, STATUS_STEPS, orderStatus } from "@/lib/order-status";
import { paymentLabel } from "@/lib/payments";
import { useNow, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { formatAddress } from "@/components/shell";
import { useReorder } from "@/components/reorder";
import { Button, Empty, FoodImage, PageHeader, cx } from "@/components/ui";

const STEP_ICONS = [ReceiptText, Store, ChefHat, PackageCheck, Bike, CircleCheck];

export function Tracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useStore();
  const catalog = useCatalog();
  const now = useNow(1000);
  const reorder = useReorder();
  const order = state.orders.find((o) => o.id === id);

  if (!order)
    return (
      <main className="flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-8">
        <PageHeader title="Order" />
        <Empty title="Order not found" body="It may have been placed on another device." action={<Link href="/orders" className="font-semibold text-green">All orders</Link>} />
      </main>
    );

  const s = orderStatus(order, now);
  const eta = [order.placedAt + order.etaMinutes[0] * 60000, order.placedAt + order.etaMinutes[1] * 60000];
  const card = "flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft";

  return (
    <main className="pb-nav flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-8">
      <PageHeader title={`Order ${order.reference}`} />
      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start md:gap-8">
        <section className={card} aria-labelledby="status-h">
          <div>
            <p className="text-[13px] font-medium text-muted-ink">{s.done ? "Delivered" : "Estimated delivery"}</p>
            <h2 id="status-h" className="tabular text-[26px] font-extrabold tracking-tight text-ink">
              {s.done ? "Enjoy your meal" : `${clockTime(eta[0])} - ${clockTime(eta[1])}`}
            </h2>
          </div>
          <ol className="flex flex-col" aria-label="Order status">
            {STATUS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = i < s.index || s.done;
              const current = i === s.index && !s.done;
              return (
                <li key={step.id} aria-current={current ? "step" : undefined} className="relative flex min-h-[52px] items-start gap-3.5">
                  {i < STATUS_STEPS.length - 1 && (
                    <span aria-hidden className={cx("absolute left-[15px] top-8 h-[calc(100%-24px)] w-0.5", i < s.index ? "bg-green" : "bg-line")} />
                  )}
                  <span
                    className={cx(
                      "relative z-10 grid size-8 shrink-0 place-items-center rounded-full",
                      done ? "bg-green text-white" : current ? "bg-orange-strong text-white ring-4 ring-peach" : "bg-cream text-muted",
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                  </span>
                  <span className="pt-1">
                    <span className={cx("block text-[15px]", current ? "font-bold text-ink" : done ? "font-medium text-ink" : "text-muted-ink")}>{step.label}</span>
                    {current && <span className="block text-[13px] text-muted-ink">In progress</span>}
                    {done && <span className="sr-only">Completed</span>}
                  </span>
                </li>
              );
            })}
          </ol>
          {IS_DEMO_TRACKING && (
            <p className="rounded-[var(--radius-tile)] bg-cream px-3.5 py-3 text-[13px] leading-relaxed text-muted-ink">
              Vendors and riders are not connected yet. Status moves on a demo timer.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className={card} aria-labelledby="items-h">
            <h2 id="items-h" className="text-[18px] font-bold text-ink">Your food</h2>
            <ul className="flex flex-col gap-3">
              {order.lines.map((l, i) => {
                const item = catalog.items.get(l.itemId);
                return (
                  <li key={i} className="flex items-center gap-3">
                    {item && <FoodImage photo={item.photo} sizes="56px" className="size-14 shrink-0 rounded-[14px]" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">
                        {l.qty}x {l.name}
                      </span>
                      <span className="block truncate text-[13px] text-muted-ink">
                        {catalog.vendors.get(l.vendorId)?.name}
                        {l.optionLabels.length ? ` · ${l.optionLabels.join(", ")}` : ""}
                      </span>
                    </span>
                    <span className="tabular text-[15px] text-ink">{naira(l.unitPrice * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="flex flex-col gap-2 border-t border-line pt-3 text-[15px]">
              {(
                [
                  ["Subtotal", naira(order.subtotal)],
                  ["Delivery", naira(order.deliveryFee)],
                  ...(order.discount ? [[`Discount (${order.promoCode})`, `-${naira(order.discount)}`]] : []),
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-ink">{k}</dt>
                  <dd className="tabular text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between text-[17px] font-bold text-ink">
                <dt>Total</dt>
                <dd className="tabular">{naira(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className={card} aria-labelledby="del-h">
            <h2 id="del-h" className="text-[18px] font-bold text-ink">Delivery</h2>
            <p className="flex gap-3 text-[15px] text-ink">
              <MapPin className="mt-0.5 size-5 shrink-0 text-orange" />
              <span>
                {formatAddress(order.address)}
                {order.contact.instructions && <span className="block text-[13px] text-muted-ink">{order.contact.instructions}</span>}
              </span>
            </p>
            <dl className="grid grid-cols-2 gap-3 text-[14px]">
              <div>
                <dt className="text-muted-ink">Vendor</dt>
                <dd className="font-medium text-ink">{order.vendorIds.map((v) => catalog.vendors.get(v)?.name).join(", ")}</dd>
              </div>
              <div>
                <dt className="text-muted-ink">Payment</dt>
                <dd className="font-medium text-ink">{paymentLabel(order.paymentMethod)}</dd>
              </div>
              <div>
                <dt className="text-muted-ink">Contact</dt>
                <dd className="font-medium text-ink">{order.contact.phone}</dd>
              </div>
              <div>
                <dt className="text-muted-ink">Placed</dt>
                <dd className="font-medium text-ink">{shortDate(order.placedAt)}</dd>
              </div>
            </dl>
          </section>

          <Button variant="secondary" size="lg" onClick={() => reorder(order)}>
            Order again
          </Button>
        </div>
      </div>
    </main>
  );
}
