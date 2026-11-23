"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { clockTime, naira, shortDate } from "@/lib/format";
import { STATUS_STEPS, orderStatus, type StatusView } from "@/lib/order-status";
import type { Order } from "@/lib/types";
import { useNow, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { Button, Empty, FoodImage, PageHeader, SectionTitle, cx } from "@/components/ui";
import { useReorder } from "@/components/reorder";

function StatusText({ v }: { v: StatusView }) {
  if (v.kind === "cancelled")
    return (
      <span className="t-support inline-flex items-center gap-1.5 font-medium text-danger">
        <span className="size-2 rounded-full bg-danger" /> Cancelled
      </span>
    );
  return (
    <span className="t-support inline-flex items-center gap-1.5 font-medium text-ink">
      <span className={cx("size-2 rounded-full", v.kind === "delivered" ? "bg-green" : "bg-orange")} /> {v.step.label}
    </span>
  );
}

function Thumbs({ order }: { order: Order }) {
  const { items } = useCatalog();
  return (
    <div className="flex -space-x-3">
      {order.lines.slice(0, 3).map((l, i) => {
        const item = items.get(l.itemId);
        return item ? <FoodImage key={i} photo={item.photo} sizes="48px" className="size-12 rounded-full ring-[3px] ring-surface" /> : null;
      })}
    </div>
  );
}

export default function OrdersPage() {
  const { state } = useStore();
  const catalog = useCatalog();
  const now = useNow();
  const reorder = useReorder();
  const withStatus = state.orders.map((o) => ({ o, v: orderStatus(o, now) }));
  const active = withStatus.filter(({ v }) => v.kind === "active");
  const past = withStatus.filter(({ v }) => v.kind !== "active");

  return (
    <main className="pb-nav flex flex-col gap-8 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:mx-auto md:w-full md:max-w-3xl md:px-0 md:pt-10">
      <PageHeader title="Orders" back={false} />
      {state.orders.length === 0 ? (
        <Empty
          title="No orders yet"
          body="Place an order and you can follow it here, then reorder it in one tap."
          action={
            <Link href="/" className="t-button inline-flex h-11 items-center rounded-full bg-orange-strong px-5 text-white hover:bg-orange-press">
              Browse food
            </Link>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <section aria-labelledby="active-h" className="flex flex-col gap-3">
              <SectionTitle id="active-h">In progress</SectionTitle>
              {active.map(({ o, v }) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="flex flex-col gap-4 rounded-[24px] bg-green p-5 text-white shadow-float transition-colors hover:bg-green-deep"
                  aria-label={`Order ${o.reference}, ${v.kind === "active" ? v.step.label : ""}. Track order`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="t-support text-white/80">Arriving between</p>
                      <p className="t-page tabular text-white">
                        {clockTime(o.placedAt + o.etaMinutes[0] * 60000)} - {clockTime(o.placedAt + o.etaMinutes[1] * 60000)}
                      </p>
                    </div>
                    <ChevronRight className="mt-2 size-5 text-white/80" aria-hidden />
                  </div>
                  <div aria-hidden className="flex gap-1">
                    {STATUS_STEPS.map((s, i) => (
                      <span key={s.id} className={cx("h-1.5 flex-1 rounded-full", i <= v.index ? "bg-orange" : "bg-white/20")} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="t-card truncate text-white">{v.kind === "active" ? v.step.label : ""}</p>
                      <p className="t-support truncate text-white/80">
                        {o.reference} · {o.vendorIds.map((id) => catalog.vendors.get(id)?.name).join(", ")}
                      </p>
                    </div>
                    <Thumbs order={o} />
                  </div>
                </Link>
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section aria-labelledby="past-h" className="flex flex-col gap-3">
              <SectionTitle id="past-h">Past orders</SectionTitle>
              <ul className="grid grid-cols-1 gap-3">
                {past.map(({ o, v }) => (
                  <li key={o.id} className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-3.5 shadow-soft">
                    <Link href={`/orders/${o.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Thumbs order={o} />
                      <span className="min-w-0 flex-1">
                        <StatusText v={v} />
                        <span className="t-card block truncate text-[15px] text-ink">{o.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}</span>
                        <span className="t-support block text-muted-ink">
                          {shortDate(o.placedAt)} · <span className="tabular">{naira(o.total)}</span>
                        </span>
                      </span>
                    </Link>
                    <Button variant="secondary" className="h-10 min-h-0 shrink-0 px-4 text-[13px]" onClick={() => reorder(o)} ariaLabel={`Reorder ${o.reference}`}>
                      Reorder
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
