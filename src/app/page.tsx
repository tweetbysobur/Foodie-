"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { BANNER_CODE, checkPromo } from "@/lib/promo";
import { naira, shortDate } from "@/lib/format";
import type { CategoryId, OrderLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet } from "@/components/shell";
import { DishRow, DishRowSkeleton, FeaturedDish, MenuLine } from "@/components/food";
import { BoardHeading, Empty, ErrorState, Tab, Wordmark, cx } from "@/components/ui";

export default function HomePage() {
  const { state, dispatch, address } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [cat, setCat] = useState<CategoryId | "popular">("popular");
  const [addrOpen, setAddrOpen] = useState(false);
  const ready = catalog.state.status === "ready" ? catalog.state.data : null;

  const shown = useMemo(() => {
    if (!ready) return [];
    const list = cat === "popular" ? ready.menu.filter((m) => m.bestSeller) : ready.menu.filter((m) => m.category === cat);
    // Dishes with photos lead; the board reads cleaner when pictures sit together at the top.
    return [...list].sort((a, b) => Number(!!b.photo) - Number(!!a.photo));
  }, [ready, cat]);

  const again = useMemo(() => {
    const seen = new Map<string, { line: OrderLine; placedAt: number; times: number }>();
    for (const o of state.orders) {
      if (o.cancelledAt) continue;
      for (const l of o.lines) {
        const prev = seen.get(l.itemId);
        if (prev) prev.times += 1;
        else seen.set(l.itemId, { line: l, placedAt: o.placedAt, times: 1 });
      }
    }
    return [...seen.values()].slice(0, 4);
  }, [state.orders]);

  const promoOk = checkPromo(BANNER_CODE, state.orders.length).ok;
  const promoApplied = state.promoCode === BANNER_CODE;
  const featured = ready?.menu.find((m) => m.id === "pounded-yam-egusi");
  const tabs: { id: CategoryId | "popular"; label: string }[] = [{ id: "popular", label: "Popular" }, ...(ready?.categories.map((c) => ({ id: c.id, label: c.label })) ?? [])];

  return (
    <main className="pb-nav px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-10">
      {/* Masthead: brand left, where it is going right */}
      <div className="flex items-center justify-between gap-4 md:hidden">
        <Wordmark className="text-[26px] leading-none" />
        <button
          onClick={() => setAddrOpen(true)}
          className="inline-flex min-w-0 items-center gap-0.5 border-b-2 border-orange pb-0.5 text-[14px] font-semibold text-green"
          aria-label={`Delivering to ${address?.area}, ${address?.city}. Change address`}
        >
          <span className="truncate">{address ? `${address.area}, ${address.city}` : "Add address"}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="md:grid md:grid-cols-[1.15fr_1fr] md:gap-14">
        <div>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-[48px] font-extrabold leading-[0.92] tracking-[-0.04em] text-ink md:mt-0 md:text-[76px]">
            Today&rsquo;s pots,
            <br />
            <span className="text-burnt-ink">near you.</span>
          </h1>
          <button
            onClick={() => setAddrOpen(true)}
            className="mt-4 hidden items-center gap-1 border-b-2 border-orange pb-0.5 text-[16px] font-semibold text-green md:inline-flex"
          >
            Delivering to {address ? `${address.area}, ${address.city}` : "add an address"}
            <ChevronDown className="size-4" aria-hidden />
          </button>

          {/* First-order band: only while the code still applies */}
          {promoOk && (
            <button
              onClick={() => {
                if (promoApplied) return router.push("/cart");
                dispatch({ type: "setPromo", code: BANNER_CODE });
                toast(`${BANNER_CODE} applied. 10% off at checkout`);
              }}
              className="mt-6 flex w-full items-center justify-between gap-3 rounded-[6px] bg-green px-4 py-3.5 text-left text-cream transition-colors hover:bg-green-deep"
              aria-label={promoApplied ? `${BANNER_CODE} applied. Go to cart` : `First order 10% off with ${BANNER_CODE}. Tap to apply`}
            >
              <span className="font-[family-name:var(--font-display)] text-[19px] font-bold leading-tight tracking-[-0.01em]">
                {promoApplied ? "Applied to your first order" : "First order: 10% off"}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[4px] bg-cream px-2.5 py-1.5 font-[family-name:var(--font-display)] text-[16px] font-extrabold tracking-[0.04em] text-green">
                {promoApplied && <Check className="size-4" strokeWidth={3} aria-hidden />}
                {BANNER_CODE}
              </span>
            </button>
          )}

          {/* Category tabs */}
          <nav aria-label="Food categories" className="no-scrollbar rail-fade -mx-5 mt-7 flex gap-5 overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0">
            {tabs.map((t) => (
              <Tab key={t.id} active={cat === t.id} onClick={() => setCat(t.id)}>
                {t.label}
              </Tab>
            ))}
          </nav>

          {/* The board */}
          <section aria-label={tabs.find((t) => t.id === cat)?.label} aria-busy={catalog.state.status === "loading"}>
            {catalog.state.status === "error" ? (
              <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
            ) : catalog.state.status === "loading" ? (
              <div>
                {[0, 1, 2, 3].map((i) => (
                  <DishRowSkeleton key={i} />
                ))}
              </div>
            ) : shown.length === 0 ? (
              <Empty title="Nothing on this board yet." body="Kitchens near you do not cook this today. Try another tab." />
            ) : (
              <ul>
                {shown.map((m, i) => (
                  <DishRow key={m.id} item={m} priority={i < 3} showBest={cat !== "popular"} />
                ))}
              </ul>
            )}
            <Link href="/search" className="t-button mt-4 inline-flex items-center text-green underline decoration-2 underline-offset-4 hover:decoration-orange">
              See the full menu
            </Link>
          </section>
        </div>

        {/* Desktop: one photographed dish beside the board */}
        {featured && (
          <aside className="hidden md:block md:pt-3">
            <FeaturedDish item={featured} kicker="From Mama Tunde's Buka" />
          </aside>
        )}
      </div>

      {/* Order again */}
      <section aria-labelledby="again-h" className="mt-12">
        <BoardHeading
          id="again-h"
          action={
            again.length > 0 && (
              <Link href="/orders" className="t-button pb-0.5 text-green underline-offset-4 hover:underline">
                History
              </Link>
            )
          }
        >
          Order again
        </BoardHeading>
        {again.length === 0 ? (
          <p className="t-body py-5 text-[15px] text-muted-ink">Dishes you order land here, ready to reorder in one tap.</p>
        ) : (
          <ul className="md:grid md:grid-cols-2 md:gap-x-12">
            {again.map(({ line, placedAt, times }) => {
              const item = catalog.items.get(line.itemId);
              if (!item) return null;
              return (
                <li key={line.itemId} className="flex items-center gap-3 border-b border-dashed border-leader py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link href={`/food/${item.id}`}>
                      <MenuLine name={`${line.qty}x ${item.name}`} price={line.unitPrice * line.qty} />
                    </Link>
                    <p className="t-support truncate text-muted-ink">
                      {catalog.vendors.get(line.vendorId)?.name}
                      {line.optionLabels.length ? ` · ${line.optionLabels.join(", ")}` : ""} · {times > 1 ? `${times} orders` : shortDate(placedAt)}
                    </p>
                  </div>
                  <button
                    className={cx("t-button h-9 shrink-0 rounded-[6px] px-3 text-green ring-[1.5px] ring-inset ring-ink/70 transition-colors hover:bg-board/60")}
                    aria-label={`Reorder ${item.name}, ${naira(line.unitPrice * line.qty)}`}
                    onClick={() => {
                      if (!item.available) return toast(`${item.name} is sold out right now`, "error");
                      const optionIds = item.options.flatMap((g) => g.choices).filter((c) => line.optionLabels.includes(c.label)).map((c) => c.id);
                      dispatch({ type: "addToCart", itemId: item.id, qty: line.qty, optionIds, note: line.note });
                      router.push("/cart");
                    }}
                  >
                    Reorder
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {addrOpen && <AddressSheet onClose={() => setAddrOpen(false)} />}
    </main>
  );
}
