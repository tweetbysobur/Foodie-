"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { naira, shortDate } from "@/lib/format";
import { orderStatus } from "@/lib/order-status";
import { useNow, useStore } from "@/store/app-store";
import { Button, Empty, PageHeader, cx } from "@/components/ui";
import { useReorder } from "@/components/reorder";

export default function OrdersPage() {
  const { state } = useStore();
  const now = useNow();
  const reorder = useReorder();
  return (
    <main className="pb-nav flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:px-0 md:pt-8">
      <PageHeader title="Orders" back={false} />
      {state.orders.length === 0 ? (
        <Empty
          title="No orders yet"
          body="When you place an order, you can track it and reorder from here."
          action={<Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-orange-strong px-5 font-bold text-white">Browse food</Link>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {state.orders.map((o) => {
            const s = orderStatus(o, now);
            return (
              <li key={o.id} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft">
                <Link href={`/orders/${o.id}`} className="flex flex-col gap-2" aria-label={`Order ${o.reference}, ${s.step.label}. View details`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
                      <span className={cx("size-2 rounded-full", s.done ? "bg-green" : "bg-orange")} />
                      {s.step.label}
                    </span>
                    <span className="text-[13px] text-muted-ink">{shortDate(o.placedAt)}</span>
                  </span>
                  <span className="text-[15px] leading-snug text-ink">{o.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}</span>
                  <span className="flex items-center justify-between">
                    <span className="tabular text-[15px] font-bold text-ink">{naira(o.total)}</span>
                    <span className="inline-flex items-center text-[13px] font-medium text-muted-ink">
                      {o.reference} <ChevronRight className="size-4" />
                    </span>
                  </span>
                </Link>
                <Button variant="secondary" onClick={() => reorder(o)}>
                  Order again
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
