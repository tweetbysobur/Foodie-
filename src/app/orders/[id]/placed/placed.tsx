"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { Info } from "lucide-react";
import { clockTime, naira } from "@/lib/format";
import { VENDORS_CONNECTED } from "@/lib/order-status";
import { paymentLabel } from "@/lib/payments";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { formatAddress } from "@/components/shell";
import { Empty, Wordmark } from "@/components/ui";

/** Confirmation: states what happened, what to pay, and what is true about the order. */
export function Placed({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useStore();
  const catalog = useCatalog();
  const order = state.orders.find((o) => o.id === id);
  if (!order)
    return (
      <main className="px-5 pt-16">
        <Empty title="Order not found" body="It may have been placed on another device." action={<Link href="/orders" className="t-button text-green">Your orders</Link>} />
      </main>
    );
  const vendors = order.vendorIds.map((v) => catalog.vendors.get(v)?.name).filter(Boolean).join(" and ");
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-5 pb-10 pt-[calc(env(safe-area-inset-top)+40px)] text-center md:pt-16">
      <Image src="/brand/foodie-mark.webp" alt="" width={140} height={140} className="animate-pop" priority />
      <p className="t-card mt-4 text-green">Order {order.reference}</p>
      <h1 className="t-display mt-1 text-ink">Order placed</h1>
      <p className="t-body mt-2 max-w-xs text-[15px] text-muted-ink">
        {VENDORS_CONNECTED
          ? `${vendors} ${order.vendorIds.length > 1 ? "have" : "has"} your order. Expected between ${clockTime(order.placedAt + order.etaMinutes[0] * 60000)} and ${clockTime(order.placedAt + order.etaMinutes[1] * 60000)} once confirmed.`
          : `Your order from ${vendors} is saved on this device.`}
      </p>

      <dl className="mt-7 w-full divide-y divide-line border-y-2 border-ink/80 text-left [&>div]:px-1">
        <div className="flex justify-between gap-4 px-5 py-3.5">
          <dt className="t-body text-muted-ink">You pay on delivery</dt>
          <dd className="t-price text-ink">{naira(order.total)}</dd>
        </div>
        <div className="flex justify-between gap-4 px-5 py-3.5">
          <dt className="t-body text-muted-ink">Payment</dt>
          <dd className="t-card text-[15px] text-ink">{paymentLabel(order.paymentMethod)}</dd>
        </div>
        <div className="flex flex-col gap-0.5 px-5 py-3.5">
          <dt className="t-body text-muted-ink">Delivering to</dt>
          <dd className="t-card text-[15px] text-ink">{formatAddress(order.address)}</dd>
        </div>
      </dl>

      {!VENDORS_CONNECTED && (
        <p className="t-support mt-4 flex w-full gap-2.5 rounded-[var(--radius-tile)] bg-sage/70 px-4 py-3 text-left text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-green" aria-hidden />
          Preview: Foodie is not connected to vendors yet, so no kitchen receives this order and nobody will deliver it.
        </p>
      )}

      <div className="mt-7 flex w-full flex-col gap-3">
        <Link href={`/orders/${order.id}`} className="t-button inline-flex h-[52px] items-center justify-center rounded-full bg-orange-strong text-[15px] text-white transition-colors hover:bg-orange-press">
          Track order
        </Link>
        <Link href="/" className="t-button inline-flex h-[52px] items-center justify-center rounded-full bg-surface text-[15px] text-green ring-[1.5px] ring-inset ring-line hover:bg-sage/50">
          Back to <Wordmark className="ml-1 text-[17px]" />
        </Link>
      </div>
    </main>
  );
}
