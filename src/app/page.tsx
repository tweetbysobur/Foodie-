"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { BANNER_CODE, checkPromo } from "@/lib/promo";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { naira, shortDate } from "@/lib/format";
import type { CategoryId, OrderLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet } from "@/components/shell";
import { FoodCard, FoodCardSkeleton } from "@/components/food";
import { Button, Chip, Empty, ErrorState, FoodImage, SectionTitle, cx } from "@/components/ui";

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

  // One card per dish, newest order first, with what was ordered last time.
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
    return [...seen.values()];
  }, [state.orders]);

  const promoOk = checkPromo(BANNER_CODE, state.orders.length).ok;
  const promoApplied = state.promoCode === BANNER_CODE;
  const heroPhoto = catalog.items.get("jollof-rice-chicken")?.photo;
  const catLabel = ready?.categories.find((c) => c.id === cat)?.label;

  return (
    <main className="pb-nav flex flex-col gap-8 pt-[calc(env(safe-area-inset-top)+16px)] md:gap-10 md:pt-10">
      {/* Hero: where, who, what */}
      <section className={cx("flex flex-col gap-6 px-5 md:px-0", promoOk && "md:grid md:grid-cols-[1fr_1.1fr] md:items-stretch md:gap-8")}>
        <div className="flex flex-col gap-5 md:justify-center">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setAddrOpen(true)}
              className="group flex min-w-0 items-center gap-2.5 rounded-full bg-surface py-2 pl-3.5 pr-4 shadow-soft transition-colors hover:bg-sage/40"
              aria-label={`Delivering to ${address?.label ?? "home"}, ${address?.area ?? ""}, ${address?.city ?? ""}. Change address`}
            >
              <MapPin className="size-[22px] shrink-0 text-orange-strong" aria-hidden />
              <span className="min-w-0 text-left">
                <span className="t-support block leading-tight text-muted-ink">Deliver to {address?.label ?? "Home"}</span>
                <span className="t-card block truncate leading-tight text-ink">{address ? `${address.area}, ${address.city}` : "Add an address"}</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-green transition-transform group-hover:translate-y-px" aria-hidden />
            </button>
            <Link
              href="/profile"
              aria-label="Your profile"
              className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-[18px] font-extrabold text-white ring-[3px] ring-surface shadow-soft md:hidden"
            >
              {state.profile?.photo ? <Image src={state.profile.photo} alt="" fill sizes="48px" className="object-cover" unoptimized /> : first[0]?.toUpperCase()}
            </Link>
          </div>

          <div>
            <p className="t-card text-muted-ink">Hey, {first} 👋</p>
            <h1 className="t-display mt-1 text-ink md:text-[44px]">What are you craving?</h1>
          </div>

          <Link
            href="/search"
            className="flex h-14 items-center gap-3 rounded-[18px] bg-surface px-4 shadow-soft transition-shadow hover:shadow-float"
            aria-label="Search meals or vendors"
          >
            <Search className="size-5 text-green" aria-hidden />
            <span className="t-body text-[15px] text-muted-ink">Search jollof, suya, vendors...</span>
          </Link>
        </div>

        {/* First-order promo. Shown only while the code still applies. */}
        {promoOk && (
          <button
            onClick={() => {
              if (promoApplied) return router.push("/cart");
              dispatch({ type: "setPromo", code: BANNER_CODE });
              toast(`${BANNER_CODE} applied. 10% off at checkout`);
            }}
            className="relative isolate flex min-h-[184px] w-full overflow-hidden rounded-[28px] bg-orange-strong text-left text-white md:min-h-[300px]"
            aria-label={promoApplied ? `${BANNER_CODE} applied. Go to cart` : `10% off your first order. Apply code ${BANNER_CODE}`}
          >
            {heroPhoto && (
              <span aria-hidden className="absolute -right-12 top-1/2 -z-10 size-[210px] -translate-y-1/2 md:-right-6 md:size-[300px]">
                <span className="absolute inset-0 rounded-full bg-orange/45" />
                <span className="absolute inset-3 overflow-hidden rounded-full">
                  <FoodImage photo={heroPhoto} sizes="300px" priority className="size-full" />
                </span>
              </span>
            )}
            <span className="flex max-w-[60%] flex-col justify-center gap-1 p-6 md:max-w-[52%] md:p-9">
              <span className="text-[44px] font-extrabold leading-[0.95] tracking-[-0.02em] md:text-[64px]">
                10%
                <span className="block text-[22px] tracking-[-0.01em] md:text-[30px]">off your first order</span>
              </span>
              <span className="t-body mt-1 text-white/90">On us. Any dish, any vendor.</span>
              <span
                className={cx(
                  "t-button mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2",
                  promoApplied ? "bg-green text-white" : "border-[1.5px] border-dashed border-white/80 text-white",
                )}
              >
                {promoApplied ? <Check className="size-4" strokeWidth={3} aria-hidden /> : null}
                {promoApplied ? `${BANNER_CODE} applied` : `Tap to use ${BANNER_CODE}`}
              </span>
            </span>
          </button>
        )}
      </section>

      {/* Categories */}
      <section aria-label="Food categories" className="flex flex-col gap-3">
        <div className="no-scrollbar rail-fade flex gap-2 overflow-x-auto scroll-smooth px-5 pb-1 md:flex-wrap md:px-0" role="group" aria-label="Category filter">
          {(["all", ...(ready?.categories.map((c) => c.id) ?? [])] as (CategoryId | "all")[]).map((id) => (
            <Chip key={id} active={cat === id} onClick={() => setCat(id)} icon={CATEGORY_ICONS[id]}>
              {id === "all" ? "All" : ready?.categories.find((c) => c.id === id)?.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Best sellers or the chosen category */}
      <section className="flex flex-col gap-4" aria-labelledby="dishes-h" aria-busy={catalog.state.status === "loading"}>
        <div className="px-5 md:px-0">
          <SectionTitle
            id="dishes-h"
            action={
              <Link href="/search" className="t-button text-green hover:underline">
                See all
              </Link>
            }
          >
            {cat === "all" ? "Best sellers near you" : catLabel}
          </SectionTitle>
        </div>
        {catalog.state.status === "error" ? (
          <div className="px-5 md:px-0">
            <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
          </div>
        ) : catalog.state.status === "loading" ? (
          <div className="no-scrollbar flex gap-3.5 overflow-x-hidden px-5 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <FoodCardSkeleton key={i} className="w-[188px] shrink-0 md:w-auto" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 md:px-0">
            <Empty compact title={`No ${catLabel?.toLowerCase()} nearby yet`} body="Vendors near you do not sell this right now. Try another category." />
          </div>
        ) : (
          <div className="no-scrollbar rail-fade flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-3 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {shown.map((m, i) => (
              <FoodCard key={m.id} item={m} priority={i < 2} showBadge={cat !== "all"} className="w-[188px] shrink-0 snap-start md:w-auto" />
            ))}
          </div>
        )}
      </section>

      {/* Order again: its own band so it reads as "yours", not more menu */}
      <section aria-labelledby="again-h" className="bg-sage/70 px-5 py-6 md:rounded-[28px] md:p-8">
        <SectionTitle
          id="again-h"
          action={
            again.length > 0 && (
              <Link href="/orders" className="t-button text-green hover:underline">
                Order history
              </Link>
            )
          }
        >
          Order again
        </SectionTitle>
        <div className="mt-4">
          {again.length === 0 ? (
            <Empty compact title="Nothing here yet" body="Dishes you order show up here, ready to reorder in one tap." />
          ) : (
            <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:grid md:grid-cols-2 md:px-0">
              {again.map(({ line, placedAt, times }) => {
                const item = catalog.items.get(line.itemId);
                if (!item) return null;
                return (
                  <article key={line.itemId} className="flex w-[300px] shrink-0 snap-start items-center gap-3 rounded-[var(--radius-card)] bg-surface p-2.5 shadow-soft md:w-auto">
                    <Link href={`/food/${item.id}`} className="shrink-0 rounded-[14px]">
                      <FoodImage photo={item.photo} sizes="72px" className="size-[72px] rounded-[14px]" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="t-card truncate text-ink">{item.name}</p>
                      <p className="t-support truncate text-muted-ink">
                        {catalog.vendors.get(line.vendorId)?.name} · {line.qty}x{line.optionLabels.length ? `, ${line.optionLabels.join(", ")}` : ""}
                      </p>
                      <p className="t-support text-muted-ink">
                        {times > 1 ? `${times} orders, last ` : ""}
                        {shortDate(placedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="t-price text-[15px] text-ink">{naira(line.unitPrice * line.qty)}</span>
                      <Button
                        variant="green"
                        className="h-9 min-h-0 px-3.5 text-[13px]"
                        ariaLabel={`Order ${item.name} again`}
                        onClick={() => {
                          if (!item.available) return toast(`${item.name} is sold out right now`, "error");
                          const optionIds = item.options.flatMap((g) => g.choices).filter((c) => line.optionLabels.includes(c.label)).map((c) => c.id);
                          dispatch({ type: "addToCart", itemId: item.id, qty: line.qty, optionIds, note: line.note });
                          router.push("/cart");
                        }}
                      >
                        Reorder
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {addrOpen && <AddressSheet onClose={() => setAddrOpen(false)} />}
    </main>
  );
}
