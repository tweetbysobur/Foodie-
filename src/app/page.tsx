"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { BANNER_CODE } from "@/lib/promo";
import { naira, shortDate } from "@/lib/format";
import type { CategoryId, OrderLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet } from "@/components/shell";
import { FoodCard, FoodCardSkeleton } from "@/components/food";
import { Button, Chip, Empty, ErrorState, FoodImage, SectionTitle } from "@/components/ui";

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

  // One card per dish, newest order first, keeping what was ordered last time.
  const again = useMemo(() => {
    const seen = new Map<string, { line: OrderLine; placedAt: number; times: number }>();
    for (const o of state.orders) {
      for (const l of o.lines) {
        const prev = seen.get(l.itemId);
        if (prev) prev.times += 1;
        else seen.set(l.itemId, { line: l, placedAt: o.placedAt, times: 1 });
      }
    }
    return [...seen.values()];
  }, [state.orders]);

  const promoPhotos = ready ? ["jollof-rice-chicken"].map((id) => catalog.items.get(id)?.photo).filter(Boolean) : [];
  const catLabel = ready?.categories.find((c) => c.id === cat)?.label;

  return (
    <main className="pb-nav flex flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:px-0 md:pt-8">
      {/* Greeting */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.06em] text-muted-ink">HEY, {first.toUpperCase()} 👋</p>
          <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-tight text-ink md:text-[36px]">What are you craving?</h1>
        </div>
        <Link href="/profile" aria-label="Your profile" className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-[18px] font-bold text-white md:hidden">
          {state.profile?.photo ? <Image src={state.profile.photo} alt="" fill sizes="48px" className="object-cover" unoptimized /> : first[0]?.toUpperCase()}
        </Link>
      </header>

      {/* Location and search */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setAddrOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-card)] bg-surface px-4 py-3 text-left shadow-soft md:max-w-md"
          aria-label={`Delivering to ${address?.label ?? "home"}, ${address?.area ?? ""}. Change address`}
        >
          <MapPin className="size-5 shrink-0 text-orange" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.08em] text-muted-ink">DELIVER TO · {address?.label.toUpperCase()}</span>
            <span className="block truncate text-[15px] font-semibold text-ink">{address ? `${address.area}, ${address.city}` : "Add an address"}</span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-muted" />
        </button>
        <Link href="/search" aria-label="Search food and vendors" className="grid w-14 shrink-0 place-items-center rounded-[var(--radius-card)] bg-surface text-green shadow-soft">
          <Search className="size-[22px]" />
        </Link>
      </div>

      {/* Categories */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Food categories">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          All
        </Chip>
        {(ready?.categories ?? []).map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      {/* First-order promo. Hidden once the customer has ordered, because the code no longer applies. */}
      {state.orders.length === 0 && (
        <button
          onClick={() => {
            dispatch({ type: "setPromo", code: BANNER_CODE });
            toast(`${BANNER_CODE} will apply at checkout`);
          }}
          className="relative flex min-h-[168px] w-full overflow-hidden rounded-[24px] bg-orange-strong text-left text-white"
          aria-label={`10% off your first order. Apply code ${BANNER_CODE}`}
        >
          <span className="relative z-10 flex max-w-[66%] flex-col justify-center gap-1 py-6 pl-6 pr-2 md:max-w-[60%]">
            <span className="text-[34px] font-extrabold leading-none tracking-tight">10% OFF</span>
            <span className="text-[17px] font-semibold">Your first order, on us.</span>
            <span className="mt-2 text-[14px] text-white/90">
              Use code <span className="rounded-md bg-white/15 px-1.5 py-0.5 font-bold tracking-wide text-white">{BANNER_CODE}</span> at checkout.
            </span>
          </span>
          <span aria-hidden className="absolute inset-y-0 right-0 w-[40%] md:w-[38%]">
            {promoPhotos[0] && <FoodImage photo={promoPhotos[0]} sizes="240px" priority className="absolute -right-8 top-1/2 size-[148px] -translate-y-1/2 rounded-full ring-4 ring-orange md:right-6 md:size-[180px]" />}
          </span>
        </button>
      )}

      {/* Best sellers or the chosen category */}
      <section className="flex flex-col gap-3.5" aria-busy={catalog.state.status === "loading"}>
        <SectionTitle>{cat === "all" ? "Best sellers near you" : catLabel}</SectionTitle>
        {catalog.state.status === "error" ? (
          <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
        ) : catalog.state.status === "loading" ? (
          <div className="no-scrollbar -mx-5 flex gap-3.5 overflow-x-hidden px-5 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <FoodCardSkeleton key={i} className="w-[180px] shrink-0 md:w-auto" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <Empty title={`No ${catLabel?.toLowerCase()} near you yet`} body="Vendors near you do not sell this right now. Try another category." />
        ) : (
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-2 scroll-px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {shown.map((m, i) => (
              <FoodCard key={m.id} item={m} priority={i < 2} showBadge={cat !== "all"} className="w-[180px] shrink-0 snap-start md:w-auto" />
            ))}
          </div>
        )}
      </section>

      {/* Order again */}
      <section className="flex flex-col gap-3.5">
        <SectionTitle action={again.length > 0 && <Link href="/orders" className="text-sm font-semibold text-green">All orders</Link>}>Order again</SectionTitle>
        {again.length === 0 ? (
          <Empty title="Nothing here yet" body="Dishes you order show up here, ready to reorder in one tap." />
        ) : (
          <div className="no-scrollbar -mx-5 flex snap-x gap-3.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
            {again.map(({ line, placedAt, times }) => {
              const item = catalog.items.get(line.itemId);
              const vendor = catalog.vendors.get(line.vendorId);
              if (!item) return null;
              return (
                <article key={line.itemId} className="flex w-[280px] shrink-0 snap-start flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-3 shadow-soft md:w-auto">
                  <p className="text-[12px] font-semibold text-muted-ink">{vendor?.name}</p>
                  <div className="flex items-center gap-3">
                    <FoodImage photo={item.photo} sizes="72px" className="size-[72px] shrink-0 rounded-[var(--radius-tile)]" />
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-ink">{item.name}</p>
                      <p className="text-[13px] text-muted-ink">
                        {line.qty}x{line.optionLabels.length ? ` · ${line.optionLabels.join(", ")}` : ""}
                      </p>
                      <p className="text-[12px] text-muted-ink">
                        {times > 1 ? `Ordered ${times} times · last ` : "Ordered "}
                        {shortDate(placedAt)}
                      </p>
                      <p className="tabular mt-0.5 text-[15px] font-bold text-ink">{naira(line.unitPrice * line.qty)}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      if (!item.available) return toast(`${item.name} is sold out right now`, "error");
                      const optionIds = item.options.flatMap((g) => g.choices).filter((c) => line.optionLabels.includes(c.label)).map((c) => c.id);
                      dispatch({ type: "addToCart", itemId: item.id, qty: line.qty, optionIds, note: line.note });
                      router.push("/cart");
                    }}
                  >
                    Order again
                  </Button>
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
