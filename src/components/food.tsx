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

export function BestSellerBadge({ onPhoto = true }: { onPhoto?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full py-1 pl-1.5 pr-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-orange-strong",
        onPhoto ? "bg-surface/95" : "bg-transparent pl-0",
      )}
    >
      <Flame className="size-3.5 fill-orange text-orange" aria-hidden />
      Best seller
    </span>
  );
}

function SoldOut() {
  return <span className="absolute left-2 top-2 rounded-full bg-surface/95 px-2.5 py-1 text-[12px] font-bold text-danger">Sold out</span>;
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

/**
 * Editorial lead dish: the photo carries the composition, the name sits on it.
 * Text sits on a deep green gradient (not black) so white type stays readable on any photo.
 */
export function FeatureDish({ item, eyebrow }: { item: MenuItem; eyebrow: string }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  return (
    <article className="relative overflow-hidden rounded-[28px] md:h-full">
      <Link href={`/food/${item.id}`} className="block md:h-full" aria-label={`${item.name} from ${vendors.get(item.vendorId)?.name}, ${naira(item.price)}`}>
        <FoodImage photo={item.photo} priority sizes="(min-width: 768px) 60vw, 100vw" className="aspect-[4/3.4] md:aspect-auto md:h-full md:min-h-[420px]" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#173f30]/90 via-[#173f30]/25 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 pr-20 md:p-7 md:pr-24">
          <span className="text-[13px] font-semibold text-white/85">{eyebrow}</span>
          <span className="t-page text-white md:text-[34px]">{item.name}</span>
          <span className="t-body text-white/90">
            {vendors.get(item.vendorId)?.name} · <span className="font-semibold text-white">{naira(item.price)}</span>
          </span>
        </span>
      </Link>
      <div className="absolute bottom-5 right-5 md:bottom-7 md:right-7">
        <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </article>
  );
}

/** Photo-first tile. No container, no shadow: the food is the card. */
export function DishTile({ item, priority, className, showBadge = false }: { item: MenuItem; priority?: boolean; className?: string; showBadge?: boolean }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  return (
    <article className={cx("group flex flex-col", className)}>
      <div className="relative">
        <Link href={`/food/${item.id}`} className="block rounded-[20px]" aria-label={`${item.name} from ${vendors.get(item.vendorId)?.name}, ${naira(item.price)}`}>
          <FoodImage
            photo={item.photo}
            priority={priority}
            sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 46vw"
            className="aspect-[4/5] rounded-[20px] [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-[1.04]"
          />
        </Link>
        {showBadge && item.bestSeller && item.available && (
          <span className="pointer-events-none absolute left-2 top-2">
            <BestSellerBadge />
          </span>
        )}
        {!item.available && <SoldOut />}
        <div className="absolute -bottom-3 right-3">
          <AddButton onClick={() => add(item)} label={`Add ${item.name} to cart`} />
        </div>
      </div>
      <Link href={`/food/${item.id}`} tabIndex={-1} className="mt-3 flex flex-col pr-2">
        <span className="t-card line-clamp-2 text-ink">{item.name}</span>
        <span className="t-support truncate text-muted-ink">{vendors.get(item.vendorId)?.name}</span>
        <span className="t-price mt-1 text-green">{naira(item.price)}</span>
      </Link>
    </article>
  );
}

export function DishTileSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[4/5] rounded-[20px]" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

/** Search result: a plain list row with a hairline, built for scanning. */
export function ResultRow({ item }: { item: MenuItem }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  return (
    <li className="flex min-w-0 items-center gap-3.5 border-b border-line py-3.5 last:border-b-0">
      <Link href={`/food/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3.5 rounded-[16px]">
        <div className="relative shrink-0">
          <FoodImage photo={item.photo} sizes="80px" className="size-20 rounded-[16px]" />
          {!item.available && <span className="absolute inset-x-1 bottom-1 rounded-full bg-surface/95 py-0.5 text-center text-[11px] font-bold text-danger">Sold out</span>}
        </div>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="t-card truncate text-ink">{item.name}</span>
          <span className="t-support truncate text-muted-ink">
            {vendors.get(item.vendorId)?.name}
            {item.bestSeller && <span className="font-semibold text-orange-strong"> · Best seller</span>}
          </span>
          <Meta item={item} />
        </span>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="t-price text-[16px] text-ink">{naira(item.price)}</span>
        <AddButton size={36} onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </li>
  );
}

export function ResultRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 border-b border-line py-3.5">
      <Skeleton className="size-20 shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Favourites: image-led collection piece with the heart on the photo. */
export function CollectionTile({ item, tall }: { item: MenuItem; tall?: boolean }) {
  const { vendors } = useCatalog();
  const add = useQuickAdd();
  const fav = useFavourite();
  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link href={`/food/${item.id}`} className="block rounded-[22px]" aria-label={`${item.name}, ${naira(item.price)}`}>
          <FoodImage
            photo={item.photo}
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
            className={cx("rounded-[22px] [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-[1.04]", tall ? "aspect-[3/4]" : "aspect-square")}
          />
        </Link>
        <FavButton active={fav.isFav(item.id)} onClick={() => fav.toggle(item)} name={item.name} className="absolute right-2 top-2 bg-surface/95" />
        {!item.available && <SoldOut />}
      </div>
      <div className="mt-2.5 flex items-start gap-2">
        <Link href={`/food/${item.id}`} tabIndex={-1} className="min-w-0 flex-1">
          <span className="t-card line-clamp-2 text-ink">{item.name}</span>
          <span className="t-support block truncate text-muted-ink">{vendors.get(item.vendorId)?.name}</span>
          <span className="t-price mt-0.5 block text-[16px] text-green">{naira(item.price)}</span>
        </Link>
        <AddButton size={36} onClick={() => add(item)} label={`Add ${item.name} to cart`} />
      </div>
    </article>
  );
}
