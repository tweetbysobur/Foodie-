"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Clock, Star, Store } from "lucide-react";
import { naira } from "@/lib/format";
import { unitPrice } from "@/lib/pricing";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { useFavourite } from "@/components/food";
import { Button, Empty, ErrorState, FavButton, FoodImage, Skeleton, Stepper, cx, defaultOptions, inputClass } from "@/components/ui";
import type { MenuItem } from "@/lib/types";

export function FoodDetail({ id }: { id: string }) {
  const catalog = useCatalog();
  if (catalog.state.status === "error") return <div className="px-5 pt-10"><ErrorState message={catalog.state.message} onRetry={catalog.retry} /></div>;
  if (catalog.state.status === "loading")
    return (
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-8" aria-busy="true">
        <Skeleton className="aspect-[4/3] w-full md:max-w-xl" />
        <Skeleton className="mt-5 h-7 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/3" />
      </div>
    );
  const item = catalog.items.get(id);
  if (!item)
    return (
      <div className="px-5 pt-10">
        <Empty title="Dish not found" body="It may have been removed from the menu." action={<Link href="/" className="font-semibold text-green">Back to home</Link>} />
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
    const group = item.options.find((g) => g.id === groupId)!;
    const groupIds = group.choices.map((c) => c.id);
    setOptionIds((cur) =>
      single ? [...cur.filter((x) => !groupIds.includes(x)), choiceId] : cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId],
    );
  };

  return (
    <main className="pb-[calc(120px+env(safe-area-inset-bottom))] md:grid md:grid-cols-2 md:gap-10 md:pb-16 md:pt-8">
      <div className="relative md:sticky md:top-24 md:self-start">
        <FoodImage photo={item.photo} sizes="(min-width: 768px) 50vw, 100vw" priority className="aspect-[4/3] w-full md:rounded-[24px]" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-4 pt-[calc(env(safe-area-inset-top)+12px)] md:hidden">
          <button onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label="Go back" className="grid size-11 place-items-center rounded-full bg-surface text-green shadow-soft">
            <ArrowLeft className="size-5" />
          </button>
          <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="bg-surface shadow-soft" />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pt-5 md:px-0 md:pt-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink md:text-[32px]">{item.name}</h1>
            <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="hidden md:grid" />
          </div>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-green">
            <Store className="size-4" /> {vendor?.name} · {vendor?.area}
          </p>
          <p className="tabular mt-3 text-[24px] font-extrabold text-ink">{naira(item.price)}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-medium text-ink">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5">
              <Star className="size-4 fill-orange text-orange" /> {item.rating.toFixed(1)} <span className="text-muted-ink">({item.ratingCount} ratings)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5">
              <Clock className="size-4 text-green" /> Ready in about {item.prepMinutes} min
            </span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-ink">{item.description}</p>
          {!item.available && <p className="mt-3 font-semibold text-danger">Sold out right now. Check back later today.</p>}
        </div>

        {item.options.map((g) => (
          <fieldset key={g.id} className="flex flex-col gap-2.5">
            <legend className="mb-2.5 flex w-full items-baseline justify-between">
              <span className="text-[18px] font-bold text-ink">{g.name}</span>
              <span className="text-[12px] font-medium text-muted-ink">{g.type === "single" ? "Pick one" : "Optional"}</span>
            </legend>
            {g.choices.map((c) => {
              const on = optionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  role={g.type === "single" ? "radio" : "checkbox"}
                  aria-checked={on}
                  onClick={() => pick(g.id, c.id, g.type === "single")}
                  className={cx("flex min-h-14 items-center gap-3 rounded-[var(--radius-tile)] px-4 text-left transition-colors", on ? "bg-sage" : "bg-surface")}
                >
                  <span className={cx("grid size-5 shrink-0 place-items-center border-2", g.type === "single" ? "rounded-full" : "rounded-md", on ? "border-green bg-green text-white" : "border-muted")}>
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-ink">{c.label}</span>
                  <span className="tabular text-[14px] text-muted-ink">{c.price ? `+${naira(c.price)}` : "Included"}</span>
                </button>
              );
            })}
          </fieldset>
        ))}

        <label className="flex flex-col gap-2">
          <span className="text-[18px] font-bold text-ink">Special instructions</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 160))}
            rows={3}
            placeholder="For example: less pepper, no onions"
            className={cx(inputClass, "py-3")}
          />
          <span className="text-right text-[12px] text-muted-ink">{note.length}/160</span>
        </label>

        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-cream px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
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
