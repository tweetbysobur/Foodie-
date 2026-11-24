"use client";

import Link from "next/link";
import { use } from "react";
import { clockTime, naira } from "@/lib/format";
import { VENDORS_CONNECTED } from "@/lib/order-status";
import { paymentLabel } from "@/lib/payments";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { formatAddress } from "@/components/shell";
import { Empty } from "@/components/ui";

/** Confirmation: what happened, what to pay, and what is true about the order. */
export function Placed({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useStore();
  const catalog = useCatalog();
  const order = state.orders.find((o) => o.id === id);
  if (!order)
    return (
      <main className="px-5 pt-16">
        <Empty title="Order not found." body="It may have been placed on another device." action={<Link href="/orders" className="t-button text-green underline">Your orders</Link>} />
      </main>
    );
  const vendors = order.vendorIds.map((v) => catalog.vendors.get(v)?.name).filter(Boolean).join(" and ");
  const rows: [string, string][] = [
    ["You pay on delivery", naira(order.total)],
    ["Payment", paymentLabel(order.paymentMethod)],
    ["From", vendors],
    ["To", formatAddress(order.address)],
  ];
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[calc(env(safe-area-inset-top)+40px)] md:pt-16">
      <p className="t-support font-semibold text-burnt-ink">Order {order.reference}</p>
      <h1 className="animate-page mt-2 font-[family-name:var(--font-display)] text-[56px] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink">
        Order
        <br />
        placed.
      </h1>
      <p className="t-body mt-4 text-[16px] text-muted-ink">
        {VENDORS_CONNECTED
          ? `Expected between ${clockTime(order.placedAt + order.etaMinutes[0] * 60000)} and ${clockTime(order.placedAt + order.etaMinutes[1] * 60000)} once the kitchen confirms.`
          : "Your order is saved on this device."}
      </p>

      <dl className="mt-8 border-t-2 border-ink">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2 border-b border-dashed border-leader py-3 text-[15px]">
            <dt className="shrink-0 text-muted-ink">{k}</dt>
            <span aria-hidden className="leader" />
            <dd className="min-w-0 text-right font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {!VENDORS_CONNECTED && (
        <p className="t-support mt-5 border-l-[3px] border-burnt pl-3 text-ink">
          Preview: Foodie is not connected to kitchens yet, so no one receives this order and nothing will be delivered.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Link href={`/orders/${order.id}`} className="t-button inline-flex h-[52px] items-center justify-center rounded-[6px] bg-orange-strong text-[16px] text-white transition-colors hover:bg-orange-press">
          Track order
        </Link>
        <Link href="/" className="t-button inline-flex h-[52px] items-center justify-center rounded-[6px] text-[16px] text-green ring-[1.5px] ring-inset ring-ink/70 hover:bg-board/60">
          Back to home
        </Link>
      </div>
    </main>
  );
}
