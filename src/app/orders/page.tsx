"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clockTime, naira, shortDate } from "@/lib/format";
import { STATUS_STEPS, orderStatus, type StatusView } from "@/lib/order-status";
import { useNow, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { BoardHeading, Empty, PageHeader, cx } from "@/components/ui";
import { useReorder } from "@/components/reorder";

function statusLabel(v: StatusView) {
  return v.kind === "cancelled" ? "Cancelled" : v.step.label;
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
    <main className="pb-nav px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:mx-auto md:w-full md:max-w-3xl md:px-0 md:pt-10">
      <PageHeader title="Orders" back={false} />
      {state.orders.length === 0 ? (
        <Empty
          title="No orders yet."
          body="Place an order and you can follow it here, then reorder it in one tap."
          action={
            <Link href="/" className="t-button inline-flex h-11 items-center rounded-[6px] bg-orange-strong px-4 text-white hover:bg-orange-press">
              See today&rsquo;s pots
            </Link>
          }
        />
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {active.length > 0 && (
            <section aria-labelledby="active-h" className="flex flex-col gap-3">
              <h2 id="active-h" className="sr-only">
                In progress
              </h2>
              {active.map(({ o, v }) => (
                <Link key={o.id} href={`/orders/${o.id}`} className="group flex flex-col gap-4 rounded-[6px] bg-green p-5 text-cream transition-colors hover:bg-green-deep">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-semibold text-cream/85">
                      {o.reference} · {o.vendorIds.map((id) => catalog.vendors.get(id)?.name).join(", ")}
                    </p>
                    <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-[40px] font-extrabold leading-none tracking-[-0.035em] tabular-nums">
                    {clockTime(o.placedAt + o.etaMinutes[0] * 60000)}
                    <span className="text-cream/70">-</span>
                    {clockTime(o.placedAt + o.etaMinutes[1] * 60000)}
                  </p>
                  <div aria-hidden className="flex gap-1">
                    {STATUS_STEPS.map((s, i) => (
                      <span key={s.id} className={cx("h-1 flex-1", i <= v.index ? "bg-orange" : "bg-cream/25")} />
                    ))}
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-[19px] font-bold tracking-[-0.01em]">{statusLabel(v)}</p>
                </Link>
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section aria-labelledby="past-h">
              <BoardHeading id="past-h">Past orders</BoardHeading>
              <ul>
                {past.map(({ o, v }) => (
                  <li key={o.id} className="flex items-center gap-3 border-b border-dashed border-leader py-4">
                    <Link href={`/orders/${o.id}`} className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2 font-[family-name:var(--font-display)] text-[17px] font-bold tracking-[-0.01em] text-ink">
                        <span className="min-w-0 truncate">{o.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}</span>
                        <span aria-hidden className="leader" />
                        <span className="tabular shrink-0">{naira(o.total)}</span>
                      </span>
                      <span className="t-support block text-muted-ink">
                        <span className={cx("font-semibold", v.kind === "cancelled" ? "text-danger" : "text-green")}>{statusLabel(v)}</span> · {shortDate(o.placedAt)} · {o.reference}
                      </span>
                    </Link>
                    <button onClick={() => reorder(o)} className="t-button h-9 shrink-0 rounded-[6px] px-3 text-green ring-[1.5px] ring-inset ring-ink/70 hover:bg-board/60" aria-label={`Reorder ${o.reference}`}>
                      Reorder
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
