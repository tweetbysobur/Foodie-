"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { naira } from "@/lib/format";
import { unitPrice } from "@/lib/pricing";
import type { MenuItem } from "@/lib/types";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { useFavourite } from "@/components/food";
import { BackButton, BoardHeading, Button, Empty, ErrorState, FavButton, FoodImage, Skeleton, Stepper, cx, defaultOptions, inputClass } from "@/components/ui";

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
      <div aria-busy="true" className="px-5 pt-16 md:px-0">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-5 w-1/3" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    );
  const item = catalog.items.get(id);
  if (!item)
    return (
      <div className="px-5 pt-16">
        <Empty title="Dish not found." body="It may have been taken off the menu." action={<Link href="/" className="t-button text-green underline">Back to home</Link>} />
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

  const facts = [
    `★ ${item.rating.toFixed(1)} from ${item.ratingCount} reviews`,
    `Ready in about ${item.prepMinutes} min`,
    vendor && `Delivery ${naira(vendor.deliveryFee)}, ${vendor.deliveryMinutes[0]}-${vendor.deliveryMinutes[1]} min`,
  ].filter(Boolean);

  return (
    <main className="pb-[calc(96px+env(safe-area-inset-bottom))] md:grid md:grid-cols-[1fr_1fr] md:gap-14 md:pb-20 md:pt-10">
      {/* Photo when we have a good one. Otherwise the name is the hero. */}
      {item.photo ? (
        <div className="relative md:sticky md:top-[104px] md:self-start">
          <FoodImage photo={item.photo} sizes="(min-width: 768px) 50vw, 100vw" priority className="aspect-[4/3.3] w-full md:aspect-[4/5] md:rounded-[6px]" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top)+12px)] md:hidden">
            <BackButton onPhoto />
            <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="bg-cream" />
          </div>
        </div>
      ) : (
        <div className="bg-green px-5 pb-8 pt-[calc(env(safe-area-inset-top)+12px)] text-cream md:sticky md:top-[104px] md:flex md:min-h-[420px] md:flex-col md:justify-end md:self-start md:rounded-[6px] md:p-10">
          <div className="mb-10 flex items-center justify-between md:hidden">
            <BackButton onPhoto />
            <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="bg-cream" />
          </div>
          <p className="text-[15px] font-semibold text-cream/85">{vendor?.name}</p>
          <p aria-hidden className="mt-2 font-[family-name:var(--font-display)] text-[52px] font-extrabold leading-[0.92] tracking-[-0.04em] md:text-[72px]">
            {item.name}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-8 px-5 pt-6 md:px-0 md:pt-0">
        <header>
          <div className="mb-3 hidden items-center justify-between md:flex">
            <BackButton />
            <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} />
          </div>
          <p className="t-support font-semibold text-burnt-ink">
            {vendor?.name} · {vendor?.area}
            {item.bestSeller && " · Best seller"}
          </p>
          <h1 className={cx("mt-1 text-ink", item.photo ? "t-page md:text-[40px]" : "t-section")}>{item.name}</h1>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.02em] text-green tabular-nums">{naira(item.price)}</p>
          <p className="t-body mt-3 text-[16px] text-ink">{item.description}</p>
          <p className="t-support mt-3 text-muted-ink">{facts.join("  ·  ")}</p>
          {!item.available && <p className="t-card mt-3 text-danger">Sold out today. Check back tomorrow.</p>}
        </header>

        {item.options.map((g) => (
          <fieldset key={g.id}>
            <legend className="w-full">
              <BoardHeading action={<span className="t-support pb-1 text-muted-ink">{g.type === "single" ? "Pick one" : "Optional"}</span>}>{g.name}</BoardHeading>
            </legend>
            {g.choices.map((c) => {
              const on = optionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  role={g.type === "single" ? "radio" : "checkbox"}
                  aria-checked={on}
                  onClick={() => pick(g.id, c.id, g.type === "single")}
                  className="flex min-h-14 w-full items-center gap-3 border-b border-dashed border-leader text-left"
                >
                  <span className={cx("grid size-[22px] shrink-0 place-items-center border-2 transition-colors", g.type === "single" ? "rounded-full" : "rounded-[4px]", on ? "border-green bg-green text-white" : "border-ink/50")}>
                    {on && <Check className="animate-pop size-3.5" strokeWidth={3} />}
                  </span>
                  <span className={cx("flex min-w-0 flex-1 items-baseline gap-2 text-[16px] text-ink", on ? "font-semibold" : "font-normal")}>
                    <span className="truncate">{c.label}</span>
                    <span aria-hidden className="leader" />
                    <span className="tabular shrink-0 font-[family-name:var(--font-display)] font-bold">{c.price ? `+${naira(c.price)}` : "Free"}</span>
                  </span>
                </button>
              );
            })}
          </fieldset>
        ))}

        <div>
          <label htmlFor="note" className="block">
            <BoardHeading as="h2">Special instructions</BoardHeading>
          </label>
          <textarea id="note" value={note} onChange={(e) => setNote(e.target.value.slice(0, 160))} rows={3} placeholder="Less pepper, no onions, extra stew" className={cx(inputClass, "mt-3 py-3")} />
          <span className="t-support mt-1 block text-right text-muted-ink">{note.length}/160</span>
        </div>

        {/* Sticky on phones, inline on desktop */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t-2 border-ink bg-cream px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
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
            Add {qty} to cart · <span className="tabular">{naira(price * qty)}</span>
          </Button>
        </div>
      </div>
    </main>
  );
}
