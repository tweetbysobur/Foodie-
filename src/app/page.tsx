"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, MapPin, RotateCw, Search } from "lucide-react";
import { BANNER_CODE, checkPromo } from "@/lib/promo";
import { naira } from "@/lib/format";
import type { CategoryId, OrderLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet } from "@/components/shell";
import { FoodCard, FoodCardSkeleton } from "@/components/food";
import { Empty, ErrorState, FoodImage, cx } from "@/components/ui";

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

  // One card per dish, newest order first.
  const again = useMemo(() => {
    const seen = new Map<string, { line: OrderLine; total: number }>();
    for (const o of state.orders) {
      if (o.cancelledAt) continue;
      for (const l of o.lines) if (!seen.has(l.itemId)) seen.set(l.itemId, { line: l, total: l.unitPrice * l.qty });
    }
    return [...seen.values()];
  }, [state.orders]);

  const promoOk = checkPromo(BANNER_CODE, state.orders.length).ok;
  const promoApplied = state.promoCode === BANNER_CODE;
  const promoPhoto = catalog.items.get("jollof-rice-chicken")?.photo;
  const catLabel = ready?.categories.find((c) => c.id === cat)?.label;

  return (
    <main className="pb-nav flex flex-col gap-6 pt-[calc(env(safe-area-inset-top)+14px)] md:gap-8 md:pt-10">
      {/* Greeting */}
      <header className="flex items-center justify-between gap-4 px-5 md:px-0">
        <div className="min-w-0">
          <p className="t-label text-orange-strong">Hey, {first} 👋</p>
          <h1 className="t-display mt-0.5 text-ink md:text-[32px]">What are you craving?</h1>
        </div>
        <Link
          href="/profile"
          aria-label="Your profile"
          className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-[16px] font-semibold text-white shadow-soft md:hidden"
        >
          {state.profile?.photo ? <Image src={state.profile.photo} alt="" fill sizes="44px" className="object-cover" unoptimized /> : first[0]?.toUpperCase()}
        </Link>
      </header>

      {/* Location and search */}
      <div className="-mt-1 flex gap-2.5 px-5 md:max-w-xl md:px-0">
        <button
          onClick={() => setAddrOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[18px] bg-surface py-2.5 pl-2.5 pr-4 text-left shadow-soft transition-shadow hover:shadow-float"
          aria-label={`Deliver to ${address?.label ?? "home"}, ${address?.area}, ${address?.city}. Change address`}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-peach text-orange-strong">
            <MapPin className="size-[18px]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-ink">Deliver to · {address?.label ?? "Home"}</span>
            <span className="block truncate text-[15px] font-bold text-ink">{address ? `${address.area}, ${address.city}` : "Add an address"}</span>
          </span>
          <ChevronDown className="size-[18px] shrink-0 text-muted" aria-hidden />
        </button>
        <Link href="/search" aria-label="Search food and vendors" className="grid w-[60px] shrink-0 place-items-center rounded-[18px] bg-surface text-ink shadow-soft transition-shadow hover:shadow-float">
          <Search className="size-[21px]" aria-hidden />
        </Link>
      </div>

      {/* Categories */}
      <div className="no-scrollbar -mt-1 flex gap-2 overflow-x-auto px-5 pb-1 md:flex-wrap md:px-0" role="group" aria-label="Food categories">
        {(["all", ...(ready?.categories.map((c) => c.id) ?? [])] as (CategoryId | "all")[]).map((id) => {
          const on = cat === id;
          return (
            <button
              key={id}
              onClick={() => setCat(id)}
              aria-pressed={on}
              className={cx(
                "h-[34px] shrink-0 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors duration-200",
                on ? "bg-orange-strong text-white" : "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-peach/60",
              )}
            >
              {id === "all" ? "All" : ready?.categories.find((c) => c.id === id)?.label}
            </button>
          );
        })}
      </div>

      {/* First-order promo: warm dark banner, photo blending in from the right */}
      {promoOk && cat === "all" && (
        <div className="px-5 md:px-0">
          <button
            onClick={() => {
              if (promoApplied) return router.push("/cart");
              dispatch({ type: "setPromo", code: BANNER_CODE });
              toast(`${BANNER_CODE} applied. 10% off at checkout`);
            }}
            className="relative isolate flex h-[148px] w-full overflow-hidden rounded-[20px] bg-promo text-left md:h-[220px]"
            aria-label={promoApplied ? `${BANNER_CODE} applied. Go to cart` : `10% off your first order. Use code ${BANNER_CODE}. Tap to apply`}
          >
            {promoPhoto && (
              <span aria-hidden className="absolute inset-y-0 right-0 -z-10 w-[64%]">
                <FoodImage photo={promoPhoto} sizes="(min-width: 768px) 600px, 260px" priority className="size-full" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#3b2419] via-[#3b2419]/55 to-[#3b2419]/0" />
              </span>
            )}
            <span className="flex max-w-[62%] flex-col justify-center gap-1.5 px-4 md:max-w-[50%] md:px-8">
              <span className="w-fit rounded-full bg-orange-strong px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-white">10% off</span>
              <span className="text-[19px] font-bold leading-[1.15] text-white md:text-[28px]">
                Your first order,
                <br />
                on us
              </span>
              <span className="text-[11.5px] text-white/85 md:text-[14px]">
                {promoApplied ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden /> {BANNER_CODE} applied
                  </span>
                ) : (
                  <>
                    Use code <span className="font-bold text-white">{BANNER_CODE}</span> at checkout
                  </>
                )}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Best sellers or the chosen category */}
      <section aria-labelledby="dishes-h" aria-busy={catalog.state.status === "loading"} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-5 md:px-0">
          <h2 id="dishes-h" className="t-section text-ink">
            {cat === "all" ? "Best sellers near you" : catLabel}
          </h2>
          <Link href="/search" className="text-[13px] font-semibold text-orange-strong">
            See all
          </Link>
        </div>
        {catalog.state.status === "error" ? (
          <div className="px-5 md:px-0">
            <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
          </div>
        ) : catalog.state.status === "loading" ? (
          <div className="no-scrollbar flex gap-3 overflow-hidden px-5 md:grid md:grid-cols-4 md:px-0">
            {[0, 1, 2, 3].map((i) => (
              <FoodCardSkeleton key={i} className="w-[138px] shrink-0 md:w-auto" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 md:px-0">
            <Empty compact title={`No ${catLabel?.toLowerCase()} nearby yet`} body="Kitchens near you do not cook this today. Try another category." />
          </div>
        ) : (
          <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5">
            {shown.map((m, i) => (
              <FoodCard key={m.id} item={m} priority={i < 3} className="w-[142px] shrink-0 snap-start md:w-auto" />
            ))}
          </div>
        )}
      </section>

      {/* Order again */}
      <section aria-labelledby="again-h" className="flex flex-col gap-3">
        <h2 id="again-h" className="t-section px-5 text-ink md:px-0">
          Order again
        </h2>
        {again.length === 0 ? (
          <div className="px-5 md:px-0">
            <div className="rounded-[18px] bg-surface p-4 shadow-soft">
              <p className="text-[15px] font-semibold text-ink">Nothing here yet</p>
              <p className="mt-0.5 text-[13px] text-muted-ink">Dishes you order show up here, ready to reorder in one tap.</p>
            </div>
          </div>
        ) : (
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {again.map(({ line, total }) => {
              const item = catalog.items.get(line.itemId);
              if (!item) return null;
              const vendor = catalog.vendors.get(line.vendorId);
              return (
                <article key={line.itemId} className="flex w-[168px] shrink-0 snap-start flex-col gap-2.5 rounded-[18px] bg-surface p-3 shadow-soft md:w-auto">
                  <div className="flex items-center gap-2.5">
                    <FoodImage photo={item.photo} sizes="44px" className="size-11 shrink-0 rounded-[12px]" />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-ink">{vendor?.name}</p>
                      <p className="text-[12px] text-muted-ink">
                        {line.qty} {line.qty === 1 ? "item" : "items"} · <span className="tabular-nums">{naira(total)}</span>
                      </p>
                    </div>
                  </div>
                  <p className="truncate text-[12.5px] text-muted-ink">{item.name}</p>
                  <button
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-cream text-[13px] font-semibold text-ink transition-colors hover:bg-peach active:scale-[0.98]"
                    aria-label={`Order ${item.name} again`}
                    onClick={() => {
                      if (!item.available) return toast(`${item.name} is sold out right now`, "error");
                      const optionIds = item.options.flatMap((g) => g.choices).filter((c) => line.optionLabels.includes(c.label)).map((c) => c.id);
                      dispatch({ type: "addToCart", itemId: item.id, qty: line.qty, optionIds, note: line.note });
                      router.push("/cart");
                    }}
                  >
                    <RotateCw className="size-3.5" aria-hidden /> Order again
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {addrOpen && <AddressSheet onClose={() => setAddrOpen(false)} />}
    </main>
  );
}
