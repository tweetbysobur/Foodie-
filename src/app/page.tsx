"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search } from "lucide-react";
import { BANNER_CODE, checkPromo } from "@/lib/promo";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { naira, shortDate } from "@/lib/format";
import type { CategoryId, OrderLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet } from "@/components/shell";
import { DishTile, DishTileSkeleton, FeatureDish } from "@/components/food";
import { Empty, ErrorState, FoodImage, Skeleton, cx } from "@/components/ui";

export default function HomePage() {
  const { state, dispatch, address } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [addrOpen, setAddrOpen] = useState(false);
  const first = state.profile?.name.split(" ")[0] ?? "";
  const ready = catalog.state.status === "ready" ? catalog.state.data : null;

  const shown = useMemo(() => {
    if (!ready) return [];
    return cat === "all" ? ready.menu.filter((m) => m.bestSeller) : ready.menu.filter((m) => m.category === cat);
  }, [ready, cat]);

  // One row per dish, newest order first, with what was ordered last time.
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
  // Not a best seller, so no photo repeats on this screen.
  const promoPhoto = catalog.items.get("pounded-yam-egusi")?.photo;
  const catLabel = ready?.categories.find((c) => c.id === cat)?.label;
  const [lead, ...rest] = shown;

  return (
    <main className="pb-nav flex flex-col gap-9 pt-[calc(env(safe-area-inset-top)+18px)] md:gap-12 md:pt-10">
      {/* Header: compact greeting, the question, where it goes */}
      <header className="flex flex-col gap-5 px-5 md:max-w-2xl md:px-0">
        <div className="flex items-center justify-between">
          <p className="t-card text-muted-ink">Hey, {first} 👋</p>
          <Link href="/profile" aria-label="Your profile" className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-green text-[16px] font-extrabold text-white md:hidden">
            {state.profile?.photo ? <Image src={state.profile.photo} alt="" fill sizes="40px" className="object-cover" unoptimized /> : first[0]?.toUpperCase()}
          </Link>
        </div>
        <div>
          <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink md:text-[56px]">
            What are you
            <br />
            craving?
          </h1>
          <p className="t-body mt-3 text-[15px] text-muted-ink">
            Delivering to{" "}
            <button
              onClick={() => setAddrOpen(true)}
              className="inline-flex items-center gap-0.5 font-sans font-bold text-green underline decoration-orange decoration-2 underline-offset-4 hover:decoration-green"
              aria-label={`Delivering to ${address?.label ?? "home"}, ${address?.area}, ${address?.city}. Change address`}
            >
              {address ? `${address.area}, ${address.city}` : "add an address"}
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </p>
        </div>
        <Link href="/search" className="flex h-14 items-center gap-3 rounded-full bg-surface px-5 ring-[1.5px] ring-line transition-shadow hover:ring-green" aria-label="Search meals or vendors">
          <Search className="size-5 text-green" aria-hidden />
          <span className="t-body text-[15px] text-muted-ink">Jollof, suya, amala, a vendor...</span>
        </Link>
      </header>

      {/* Categories: a text strip with an underline, not another row of pills */}
      <nav aria-label="Food categories" className="no-scrollbar rail-fade -mt-2 flex gap-1 overflow-x-auto border-b border-line px-3 md:px-0">
        {(["all", ...(ready?.categories.map((c) => c.id) ?? [])] as (CategoryId | "all")[]).map((id) => {
          const Icon = CATEGORY_ICONS[id];
          const on = cat === id;
          return (
            <button
              key={id}
              onClick={() => setCat(id)}
              aria-pressed={on}
              className={cx("relative flex min-w-[68px] shrink-0 flex-col items-center gap-1.5 px-2 pb-3 pt-1 transition-colors", on ? "text-green" : "text-muted-ink hover:text-green")}
            >
              <Icon className={cx("size-6 transition-colors", on ? "text-orange-strong" : "text-muted")} strokeWidth={on ? 2.2 : 1.8} aria-hidden />
              <span className="t-nav whitespace-nowrap text-[12px]">{id === "all" ? "All" : ready?.categories.find((c) => c.id === id)?.label}</span>
              <span aria-hidden className={cx("absolute inset-x-3 -bottom-px h-[3px] rounded-full transition-colors", on ? "bg-orange" : "bg-transparent")} />
            </button>
          );
        })}
      </nav>

      {/* Promo: burnt orange, type-led, photo as a full-height crop. Only while the code applies. */}
      {promoOk && cat === "all" && (
        <section aria-label="First order offer" className="px-5 md:px-0">
          <button
            onClick={() => {
              if (promoApplied) return router.push("/cart");
              dispatch({ type: "setPromo", code: BANNER_CODE });
              toast(`${BANNER_CODE} applied. 10% off at checkout`);
            }}
            className="relative grid min-h-[220px] w-full grid-cols-[1.15fr_1fr] overflow-hidden rounded-[28px] bg-burnt text-left text-white md:min-h-[280px] md:grid-cols-[1fr_1.2fr]"
            aria-label={promoApplied ? `${BANNER_CODE} applied. Go to cart` : `10% off your first order with code ${BANNER_CODE}. Tap to apply`}
          >
            <span className="flex flex-col justify-between gap-4 p-5 md:p-9">
              <span>
                <span className="block text-[68px] font-extrabold leading-[0.85] tracking-[-0.04em] md:text-[104px]">10%</span>
                <span className="mt-2 block text-[20px] font-bold leading-tight md:text-[28px]">
                  off your
                  <br />
                  first order
                </span>
              </span>
              <span className={cx("inline-flex w-fit items-center gap-2 rounded-[12px] px-3 py-2", promoApplied ? "bg-green" : "bg-surface")}>
                {promoApplied ? (
                  <>
                    <Check className="size-4 text-white" strokeWidth={3} aria-hidden />
                    <span className="text-[15px] font-bold text-white">{BANNER_CODE} applied</span>
                  </>
                ) : (
                  <>
                    <span className="text-[12px] font-semibold text-muted-ink">Code</span>
                    <span className="text-[17px] font-extrabold tracking-wide text-green">{BANNER_CODE}</span>
                  </>
                )}
              </span>
            </span>
            {promoPhoto && (
              <span aria-hidden className="relative">
                <span className="absolute inset-0">
                  <FoodImage photo={promoPhoto} sizes="(min-width: 768px) 520px, 45vw" priority className="size-full" />
                </span>
              </span>
            )}
          </button>
        </section>
      )}

      {/* Dishes: one lead, the rest as photo tiles */}
      <section className="flex flex-col gap-5" aria-labelledby="dishes-h" aria-busy={catalog.state.status === "loading"}>
        <div className="flex items-end justify-between gap-3 px-5 md:px-0">
          <h2 id="dishes-h" className="text-[24px] font-extrabold leading-tight tracking-[-0.015em] text-ink md:text-[30px]">
            {cat === "all" ? "Best sellers near you" : catLabel}
          </h2>
          <Link href="/search" className="t-button shrink-0 pb-1 text-green underline-offset-4 hover:underline">
            See all
          </Link>
        </div>

        {catalog.state.status === "error" ? (
          <div className="px-5 md:px-0">
            <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
          </div>
        ) : catalog.state.status === "loading" ? (
          <div className="flex flex-col gap-5 px-5 md:grid md:grid-cols-4 md:px-0">
            <Skeleton className="aspect-[4/3.4] rounded-[28px] md:col-span-2 md:row-span-2 md:aspect-auto" />
            <div className="grid grid-cols-2 gap-4 md:contents">
              {[0, 1, 2, 3].map((i) => (
                <DishTileSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 md:px-0">
            <Empty plain title={`No ${catLabel?.toLowerCase()} nearby yet`} body="Vendors near you do not sell this right now. Try another category." />
          </div>
        ) : cat === "all" ? (
          <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-8">
            <div className="px-5 md:col-span-2 md:row-span-2 md:px-0">
              <FeatureDish item={lead} eyebrow="Most loved on Foodie" />
            </div>
            <div className="no-scrollbar rail-fade flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 md:contents">
              {rest.map((m, i) => (
                <DishTile key={m.id} item={m} priority={i < 2} className={cx("w-[44vw] max-w-[190px] shrink-0 snap-start md:w-auto md:max-w-none", i >= 4 && "md:hidden")} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 px-5 md:grid-cols-4 md:gap-x-5 md:px-0">
            {shown.map((m, i) => (
              <DishTile key={m.id} item={m} priority={i < 2} showBadge />
            ))}
          </div>
        )}
      </section>

      {/* Order again: compact, list-like, quick to act on */}
      <section aria-labelledby="again-h" className="px-5 md:px-0">
        <div className="flex items-end justify-between gap-3 border-b-2 border-ink/80 pb-2.5">
          <h2 id="again-h" className="t-section text-ink">
            Order again
          </h2>
          {again.length > 0 && (
            <Link href="/orders" className="t-button pb-0.5 text-green underline-offset-4 hover:underline">
              History
            </Link>
          )}
        </div>
        {again.length === 0 ? (
          <Empty plain compact title="Nothing here yet" body="Dishes you order show up here, ready to reorder in one tap." />
        ) : (
          <ul className="md:grid md:grid-cols-2 md:gap-x-10">
            {again.map(({ line, placedAt, times }) => {
              const item = catalog.items.get(line.itemId);
              if (!item) return null;
              return (
                <li key={line.itemId} className="flex items-center gap-3.5 border-b border-line py-3.5">
                  <Link href={`/food/${item.id}`} className="shrink-0 rounded-[14px]">
                    <FoodImage photo={item.photo} sizes="60px" className="size-[60px] rounded-[14px]" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="t-card truncate text-ink">{item.name}</p>
                    <p className="t-support truncate text-muted-ink">
                      {line.qty}x{line.optionLabels.length ? ` · ${line.optionLabels.join(", ")}` : ""} · {times > 1 ? `${times} orders` : shortDate(placedAt)}
                    </p>
                    <p className="t-price text-[15px] text-ink">{naira(line.unitPrice * line.qty)}</p>
                  </div>
                  <button
                    className="t-button h-10 shrink-0 rounded-full bg-green px-4 text-white transition-[background-color,transform] hover:bg-green-deep active:scale-95"
                    aria-label={`Reorder ${item.name}`}
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
