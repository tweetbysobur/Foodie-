"use client";

import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { naira } from "@/lib/format";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { AddButton, FavButton, FoodImage, Skeleton, cx, defaultOptions } from "./ui";

export function useQuickAdd() {
  const { dispatch } = useStore();
  const toast = useToast();
  return (item: MenuItem) => {
    if (!item.available) return toast(`${item.name} is sold out right now`, "error");
    dispatch({ type: "addToCart", itemId: item.id, qty: 1, optionIds: defaultOptions(item), note: "" });
    toast(`${item.name} added to cart`);
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

/** Grid or rail card: photo, best seller badge, name, vendor, price, add. */
/** showBadge: false in the best sellers rail, where every card would carry the same badge. */
export function FoodCard({ item, priority, className, showBadge = true }: { item: MenuItem; priority?: boolean; className?: string; showBadge?: boolean }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  return (
    <article className={cx("relative flex flex-col rounded-[var(--radius-card)] bg-surface p-2.5 shadow-soft", className)}>
      <Link href={`/food/${item.id}`} className="flex flex-1 flex-col" aria-label={`${item.name}, ${naira(item.price)}`}>
        <div className="relative">
          <FoodImage photo={item.photo} priority={priority} sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 180px" className="aspect-square rounded-[var(--radius-tile)]" />
          {showBadge && item.bestSeller && (
            <span className="absolute left-2 top-2 rounded-lg bg-green px-2 py-1 text-[11px] font-bold tracking-wider text-white">BEST SELLER</span>
          )}
          {!item.available && <span className="absolute inset-x-2 bottom-2 rounded-lg bg-surface/95 py-1 text-center text-[12px] font-bold text-danger">Sold out</span>}
        </div>
        <span className="mt-2.5 line-clamp-2 text-[16px] font-semibold leading-tight text-ink">{item.name}</span>
        <span className="mt-0.5 truncate text-[13px] text-muted-ink">{vendors.get(item.vendorId)?.name}</span>
        <span className="tabular mt-auto pt-2 pr-12 text-[16px] font-bold text-ink">{naira(item.price)}</span>
      </Link>
      <div className="absolute bottom-2.5 right-2.5">
        <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </article>
  );
}

export function FoodCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cx("rounded-[var(--radius-card)] bg-surface p-2.5", className)}>
      <Skeleton className="aspect-square" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-4 h-4 w-1/3" />
    </div>
  );
}

/** List row: search results, favourites, vendor menus. */
export function FoodRow({ item, trailing }: { item: MenuItem; trailing?: "add" | "fav" }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  const fav = useFavourite();
  const vendor = vendors.get(item.vendorId);
  return (
    <article className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-2.5 pr-3 shadow-soft">
      <Link href={`/food/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
        <FoodImage photo={item.photo} sizes="88px" className="size-[88px] shrink-0 rounded-[var(--radius-tile)]" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[16px] font-semibold text-ink">{item.name}</span>
          <span className="truncate text-[13px] text-muted-ink">{vendor?.name}</span>
          <span className="flex items-center gap-3 text-[12px] font-medium text-muted-ink">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-orange text-orange" />
              {item.rating.toFixed(1)}
            </span>
            {vendor && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {vendor.deliveryMinutes[0]}-{vendor.deliveryMinutes[1]} min
              </span>
            )}
          </span>
          <span className="tabular mt-0.5 text-[15px] font-bold text-ink">
            {naira(item.price)}
            {!item.available && <span className="ml-2 text-[12px] font-bold text-danger">Sold out</span>}
          </span>
        </span>
      </Link>
      {trailing === "fav" ? (
        <div className="flex flex-col items-center gap-1">
          <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} />
          <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
        </div>
      ) : (
        <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      )}
    </article>
  );
}

export function FoodRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-2.5">
      <Skeleton className="size-[88px] shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/4" />
      </div>
    </div>
  );
}
