"use client";

import Link from "next/link";
import type { MenuItem } from "@/lib/types";
import { naira } from "@/lib/format";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { AddText, FavButton, FoodImage, Skeleton, cx, defaultOptions } from "./ui";

/** Adds with the default options. Returns false when the dish cannot be added. */
export function useQuickAdd() {
  const { dispatch } = useStore();
  const toast = useToast();
  return (item: MenuItem) => {
    if (!item.available) {
      toast(`${item.name} is sold out right now`, "error");
      return false;
    }
    dispatch({ type: "addToCart", itemId: item.id, qty: 1, optionIds: defaultOptions(item), note: "" });
    toast(`${item.name} added to cart`);
    return true;
  };
}

export function useFavourite() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  return {
    isFav: (id: string) => state.favourites.includes(id),
    toggle: (item: MenuItem) => {
      const was = state.favourites.includes(item.id);
      dispatch({ type: "toggleFavourite", itemId: item.id });
      toast(was ? `Removed ${item.name} from saved` : `Saved ${item.name}`);
    },
  };
}

/** Name, dotted leader, price: the line a buka menu board is made of. */
export function MenuLine({ name, price, size = "md", className }: { name: string; price: number; size?: "md" | "lg"; className?: string }) {
  return (
    <span className={cx("flex items-baseline gap-2 font-[family-name:var(--font-display)] font-bold tracking-[-0.01em] text-ink", size === "lg" ? "text-[20px]" : "text-[17px]", className)}>
      <span className="min-w-0 truncate">{name}</span>
      <span aria-hidden className="leader" />
      <span className="tabular shrink-0">{naira(price)}</span>
    </span>
  );
}

/** Meta under a dish: vendor, time, rating. Plain text, no icons. */
export function DishMeta({ item, showVendor = true }: { item: MenuItem; showVendor?: boolean }) {
  const { vendors } = useCatalog();
  const v = vendors.get(item.vendorId);
  // Rating lives on the dish page; the row keeps only what fits on one line.
  const bits = [showVendor && v?.name, v && `${v.deliveryMinutes[0]}-${v.deliveryMinutes[1]} min`].filter(Boolean);
  return <span className="t-support block truncate text-muted-ink">{bits.join(" · ")}</span>;
}

/**
 * The menu board row. Photo only when the dish has a strong one.
 * Tap the row for the dish page; Add puts it in the cart with default options.
 */
/** showBest: false where every row is a best seller anyway (the Popular tab). */
export function DishRow({ item, priority, trailing = "add", showBest = true }: { item: MenuItem; priority?: boolean; trailing?: "add" | "saved"; showBest?: boolean }) {
  const add = useQuickAdd();
  const fav = useFavourite();
  return (
    <li className="flex gap-3.5 border-b border-dashed border-leader py-3.5">
      {item.photo && (
        <Link href={`/food/${item.id}`} tabIndex={-1} aria-hidden className="shrink-0">
          <FoodImage photo={item.photo} priority={priority} sizes="72px" className="size-[72px] rounded-[6px]" />
        </Link>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <Link href={`/food/${item.id}`} className="rounded-[4px]">
          <MenuLine name={item.name} price={item.price} />
        </Link>
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0">
            <DishMeta item={item} />
            {!item.available && <span className="t-support font-semibold text-danger">Sold out today</span>}
            {item.available && item.bestSeller && showBest && trailing === "add" && <span className="t-support font-semibold text-burnt-ink">Best seller</span>}
          </span>
          {trailing === "saved" ? (
            <span className="flex shrink-0 items-center gap-1">
              <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="size-9" />
              <AddText onClick={() => add(item)} label={`Add ${item.name} to cart`} />
            </span>
          ) : (
            <AddText onClick={() => add(item)} label={`Add ${item.name} to cart`} />
          )}
        </div>
      </div>
    </li>
  );
}

export function DishRowSkeleton() {
  return (
    <div className="flex gap-3.5 border-b border-dashed border-leader py-3.5">
      <Skeleton className="size-[72px] shrink-0" />
      <div className="flex-1 pt-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-3 h-3 w-1/2" />
      </div>
    </div>
  );
}

/** A featured dish with a photo: big image, board line under it. Used sparingly. */
export function FeaturedDish({ item, kicker }: { item: MenuItem; kicker: string }) {
  const add = useQuickAdd();
  if (!item.photo) return null;
  return (
    <article className="flex flex-col gap-3">
      <Link href={`/food/${item.id}`} className="block" aria-label={`${item.name}, ${naira(item.price)}`}>
        <FoodImage photo={item.photo} priority sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[16/11] rounded-[6px]" />
      </Link>
      <p className="t-support font-semibold text-burnt-ink">{kicker}</p>
      <Link href={`/food/${item.id}`}>
        <MenuLine name={item.name} price={item.price} size="lg" />
      </Link>
      <div className="flex items-center justify-between gap-3">
        <DishMeta item={item} />
        <AddText onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </article>
  );
}
