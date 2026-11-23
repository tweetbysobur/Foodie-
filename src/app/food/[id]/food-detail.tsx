"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bike, Check, Clock, Star, Store } from "lucide-react";
import { naira } from "@/lib/format";
import { unitPrice } from "@/lib/pricing";
import type { MenuItem } from "@/lib/types";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { BestSellerBadge, useFavourite } from "@/components/food";
import { BackButton, Button, Empty, ErrorState, FavButton, FoodImage, Skeleton, Stepper, cx, defaultOptions, inputClass } from "@/components/ui";

export function FoodDetail({ id }: { id: string }) {
  const catalog = useCatalog();
  if (catalog.state.status === "error")
    return (
      <div className="px-5 pt-16">
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      </div>
    );
  if (catalog.state.status === "loading")
    return (
      <div aria-busy="true" className="md:grid md:grid-cols-2 md:gap-10 md:pt-10">
        <Skeleton className="aspect-[5/4] w-full rounded-none md:rounded-[28px]" />
        <div className="px-5 pt-6 md:px-0">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <Skeleton className="mt-6 h-24 w-full" />
        </div>
      </div>
    );
  const item = catalog.items.get(id);
  if (!item)
    return (
      <div className="px-5 pt-16">
        <Empty title="Dish not found" body="It may have been taken off the menu." action={<Link href="/" className="t-button text-green">Back to home</Link>} />
      </div>
    );
  return <Detail key={item.id} item={item} />;
}

function Detail({ item }: { item: MenuItem }) {
  const { vendors } = useCatalog();
  const { dispatch } = useStore();
  const toast = useToast();
  const router = useRouter();
  const fav = useFavourite();
  const vendor = vendors.get(item.vendorId);
  const [optionIds, setOptionIds] = useState<string[]>(defaultOptions(item));
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const price = unitPrice(item, optionIds);

  const pick = (groupId: string, choiceId: string, single: boolean) => {
    const groupIds = item.options.find((g) => g.id === groupId)!.choices.map((c) => c.id);
    setOptionIds((cur) => (single ? [...cur.filter((x) => !groupIds.includes(x)), choiceId] : cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId]));
  };

  return (
    <main className="pb-[calc(112px+env(safe-area-inset-bottom))] md:grid md:grid-cols-[1.05fr_1fr] md:gap-12 md:pb-20 md:pt-10">
      {/* Photo: edge to edge on phones, framed on desktop */}
      <div className="relative md:sticky md:top-[104px] md:self-start">
        <FoodImage photo={item.photo} sizes="(min-width: 768px) 55vw, 100vw" priority className="aspect-[5/4] w-full md:aspect-square md:rounded-[32px]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top)+12px)] md:hidden">
          <BackButton />
          <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="bg-surface shadow-soft" />
        </div>
      </div>

      <div className="relative -mt-7 flex flex-col gap-7 rounded-t-[28px] bg-cream px-5 pt-6 md:mt-0 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
        <header>
          <div className="mb-4 hidden md:block">
            <BackButton />
          </div>
          {item.bestSeller && (
            <div className="mb-2.5">
              <BestSellerBadge />
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <h1 className="t-page text-ink md:text-[32px]">{item.name}</h1>
            <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="hidden bg-surface shadow-soft md:grid" />
          </div>
          <p className="t-price mt-2 text-[22px] text-green">{naira(item.price)}</p>
          <p className="t-body mt-3 text-[15px] text-muted-ink">{item.description}</p>
          {!item.available && <p className="t-card mt-3 text-danger">Sold out right now. Check back later today.</p>}
        </header>

        {/* Facts: rating, prep, delivery. Plain row, no boxes */}
        <dl className="grid grid-cols-3 divide-x divide-line rounded-[var(--radius-card)] bg-surface py-3.5 text-center shadow-soft">
          <div className="px-2">
            <dt className="t-support text-muted-ink">Rating</dt>
            <dd className="t-card mt-0.5 inline-flex items-center gap-1 text-ink">
              <Star className="size-4 fill-orange text-orange" aria-hidden /> {item.rating.toFixed(1)}
            </dd>
            <dd className="t-support text-muted-ink">{item.ratingCount} reviews</dd>
          </div>
          <div className="px-2">
            <dt className="t-support text-muted-ink">Ready in</dt>
            <dd className="t-card mt-0.5 inline-flex items-center gap-1 text-ink">
              <Clock className="size-4 text-green" aria-hidden /> {item.prepMinutes} min
            </dd>
            <dd className="t-support text-muted-ink">to prepare</dd>
          </div>
          <div className="px-2">
            <dt className="t-support text-muted-ink">Delivery</dt>
            <dd className="t-card mt-0.5 inline-flex items-center gap-1 text-ink">
              <Bike className="size-4 text-green" aria-hidden /> {naira(vendor?.deliveryFee ?? 0)}
            </dd>
            <dd className="t-support text-muted-ink">
              {vendor?.deliveryMinutes[0]}-{vendor?.deliveryMinutes[1]} min
            </dd>
          </div>
        </dl>

        {vendor && (
          <div className="flex items-center gap-3 border-y border-line py-3.5">
            <Store className="size-5 shrink-0 text-green" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="t-card truncate text-ink">{vendor.name}</p>
              <p className="t-support text-muted-ink">
                {vendor.area}, Abeokuta · {vendor.rating.toFixed(1)} vendor rating
              </p>
            </div>
          </div>
        )}

        {item.options.map((g) => (
          <fieldset key={g.id} className="flex flex-col gap-2">
            <legend className="mb-2.5 flex w-full items-baseline justify-between gap-3">
              <span className="t-section text-[18px] text-ink">{g.name}</span>
              <span className={cx("t-support", g.type === "single" ? "font-medium text-ink" : "text-muted-ink")}>{g.type === "single" ? "Pick one" : "Optional"}</span>
            </legend>
            {g.choices.map((c) => {
              const on = optionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  role={g.type === "single" ? "radio" : "checkbox"}
                  aria-checked={on}
                  onClick={() => pick(g.id, c.id, g.type === "single")}
                  className={cx(
                    "flex min-h-14 items-center gap-3 rounded-[var(--radius-tile)] px-4 text-left transition-[background-color,box-shadow] duration-150",
                    on ? "bg-sage shadow-[inset_0_0_0_2px_var(--color-green)]" : "bg-surface shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-sage/30",
                  )}
                >
                  <span className={cx("grid size-[22px] shrink-0 place-items-center border-2 transition-colors", g.type === "single" ? "rounded-full" : "rounded-[7px]", on ? "border-green bg-green text-white" : "border-muted bg-surface")}>
                    {on && <Check className="animate-pop size-3.5" strokeWidth={3} />}
                  </span>
                  <span className={cx("flex-1 text-[15px]", on ? "font-semibold text-ink" : "font-medium text-ink")}>{c.label}</span>
                  <span className="t-support tabular text-muted-ink">{c.price ? `+${naira(c.price)}` : "Included"}</span>
                </button>
              );
            })}
          </fieldset>
        ))}

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="t-section text-[18px] text-ink">
            Special instructions
          </label>
          <textarea id="note" value={note} onChange={(e) => setNote(e.target.value.slice(0, 160))} rows={3} placeholder="Less pepper, no onions, extra stew" className={cx(inputClass, "py-3")} />
          <span className="t-support self-end text-muted-ink">{note.length}/160</span>
        </div>

        {/* Sticky on phones, inline on desktop */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-cream/95 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Stepper qty={qty} onChange={setQty} name={item.name} />
          <Button
            size="lg"
            className="flex-1"
            disabled={!item.available}
            onClick={() => {
              dispatch({ type: "addToCart", itemId: item.id, qty, optionIds, note: note.trim() });
              toast(`${qty}x ${item.name} added to cart`);
              if (history.length > 1) router.back();
              else router.push("/");
            }}
          >
            Add to cart · <span className="tabular">{naira(price * qty)}</span>
          </Button>
        </div>
      </div>
    </main>
  );
}
