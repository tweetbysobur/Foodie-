"use client";

import Link from "next/link";
import { Clock, Flame, Star } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { naira } from "@/lib/format";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { AddButton, FavButton, FoodImage, Skeleton, cx, defaultOptions } from "./ui";

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
      toast(was ? `Removed ${item.name} from favourites` : `Saved ${item.name} to favourites`);
    },
  };
}

export function BestSellerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 py-1 pl-1.5 pr-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-orange-strong shadow-soft">
      <Flame className="size-3.5 fill-orange text-orange" aria-hidden />
      Best seller
    </span>
  );
}

function SoldOut() {
  return <span className="absolute inset-x-2 bottom-2 rounded-full bg-surface/95 py-1 text-center text-[12px] font-bold text-danger">Sold out</span>;
}

/**
 * Discovery card: square photo, name, vendor, price, add.
 * showBadge is false in the best sellers row, where every card would carry the same badge.
 */
export function FoodCard({ item, priority, className, showBadge = true }: { item: MenuItem; priority?: boolean; className?: string; showBadge?: boolean }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  return (
    <article className={cx("group relative flex flex-col rounded-[var(--radius-card)] bg-surface p-2 shadow-soft", className)}>
      <Link href={`/food/${item.id}`} className="flex flex-1 flex-col rounded-[var(--radius-tile)]" aria-label={`${item.name} from ${vendors.get(item.vendorId)?.name}, ${naira(item.price)}`}>
        <div className="relative">
          <FoodImage
            photo={item.photo}
            priority={priority}
            sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 190px"
            className="aspect-square rounded-[var(--radius-tile)] [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-[1.03]"
          />
          {showBadge && item.bestSeller && (
            <span className="absolute left-2 top-2">
              <BestSellerBadge />
            </span>
          )}
          {!item.available && <SoldOut />}
        </div>
        <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2.5">
          <span className="t-card line-clamp-2 text-ink">{item.name}</span>
          <span className="t-support truncate text-muted-ink">{vendors.get(item.vendorId)?.name}</span>
          <span className="t-price mt-auto pr-11 pt-2 text-ink">{naira(item.price)}</span>
        </div>
      </Link>
      <div className="absolute bottom-2.5 right-2.5">
        <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </article>
  );
}

export function FoodCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cx("rounded-[var(--radius-card)] bg-surface p-2", className)}>
      <Skeleton className="aspect-square" />
      <div className="px-1.5 pt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <Skeleton className="mt-4 h-4 w-1/3" />
      </div>
    </div>
  );
}

export function Meta({ item, compact }: { item: MenuItem; compact?: boolean }) {
  const { vendors } = useCatalog();
  const v = vendors.get(item.vendorId);
  return (
    <span className="t-support flex items-center gap-3 text-muted-ink">
      <span className="inline-flex items-center gap-1">
        <Star className="size-3.5 fill-orange text-orange" aria-hidden />
        <span className="font-medium text-ink">{item.rating.toFixed(1)}</span>
        <span className="sr-only">out of 5</span>
      </span>
      {v && !compact && (
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {v.deliveryMinutes[0]}-{v.deliveryMinutes[1]} min
        </span>
      )}
    </span>
  );
}

/** Search result row: compact, scannable, photo left. */
export function FoodRow({ item }: { item: MenuItem }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface p-2 pr-3 shadow-soft">
      <Link href={`/food/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3.5 rounded-[var(--radius-tile)]">
        <div className="relative shrink-0">
          <FoodImage photo={item.photo} sizes="92px" className="size-[92px] rounded-[var(--radius-tile)]" />
          {!item.available && <span className="absolute inset-x-1 bottom-1 rounded-full bg-surface/95 py-0.5 text-center text-[11px] font-bold text-danger">Sold out</span>}
        </div>
        <span className="flex min-w-0 flex-col gap-0.5">
          {item.bestSeller && <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-orange-strong">Best seller</span>}
          <span className="t-card truncate text-ink">{item.name}</span>
          <span className="t-support truncate text-muted-ink">{vendors.get(item.vendorId)?.name}</span>
          <Meta item={item} />
          <span className="t-price mt-0.5 text-ink">{naira(item.price)}</span>
        </span>
      </Link>
      <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
    </article>
  );
}

export function FoodRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-2">
      <Skeleton className="size-[92px] shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/4" />
      </div>
    </div>
  );
}

/** Favourites card: tall photo, heart on the photo, the collection feel. */
export function SavedCard({ item }: { item: MenuItem }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  const fav = useFavourite();
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[24px] bg-surface shadow-soft">
      <Link href={`/food/${item.id}`} className="flex flex-1 flex-col">
        <FoodImage photo={item.photo} sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw" className="aspect-[4/5]" />
        <div className="flex flex-1 flex-col gap-0.5 p-3">
          <span className="t-card line-clamp-2 text-ink">{item.name}</span>
          <span className="t-support truncate text-muted-ink">{vendors.get(item.vendorId)?.name}</span>
          <Meta item={item} compact />
          <span className="t-price mt-auto pr-10 pt-1.5 text-ink">{naira(item.price)}</span>
        </div>
      </Link>
      <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="absolute right-2 top-2 bg-surface/95 shadow-soft" />
      <div className="absolute bottom-3 right-3">
        <AddButton size={36} onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </article>
  );
}
