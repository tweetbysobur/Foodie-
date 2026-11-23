"use client";

import Link from "next/link";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { CollectionTile } from "@/components/food";
import { Empty, ErrorState, PageHeader, Skeleton } from "@/components/ui";

export default function FavouritesPage() {
  const { state } = useStore();
  const catalog = useCatalog();
  const saved = state.favourites.map((id) => catalog.items.get(id)).filter((m) => m !== undefined);
  return (
    <main className="pb-nav flex flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:px-0 md:pt-10">
      <PageHeader
        title="Favourites"
        back={false}
        subtitle={saved.length > 0 ? `${saved.length} saved ${saved.length === 1 ? "meal" : "meals"}, ready when you are` : undefined}
      />
      {catalog.state.status === "error" ? (
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      ) : catalog.state.status === "loading" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-[22px]" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <Empty
          title="Start your collection"
          body="Tap the heart on any dish to keep it here. Your go-to orders, one tap away."
          action={
            <Link href="/" className="t-button inline-flex h-11 items-center rounded-full bg-orange-strong px-5 text-white hover:bg-orange-press">
              Find something tasty
            </Link>
          }
        />
      ) : (
        // Masonry: alternating tall and square photos read as a personal collection, not a menu grid.
        <div className="columns-2 gap-4 md:columns-3 md:gap-6 lg:columns-4">
          {saved.map((m, i) => (
            <div key={m.id} className="mb-6 break-inside-avoid">
              <CollectionTile item={m} tall={i % 3 === 0} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
