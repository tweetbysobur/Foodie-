"use client";

import Link from "next/link";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { FoodRow, FoodRowSkeleton } from "@/components/food";
import { Empty, ErrorState, PageHeader } from "@/components/ui";

export default function FavouritesPage() {
  const { state } = useStore();
  const catalog = useCatalog();
  const saved = state.favourites.map((id) => catalog.items.get(id)).filter((m) => m !== undefined);
  return (
    <main className="pb-nav flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:px-0 md:pt-8">
      <PageHeader title="Favourites" back={false} />
      {catalog.state.status === "error" ? (
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      ) : catalog.state.status === "loading" ? (
        <div className="grid gap-3 md:grid-cols-2">{[0, 1].map((i) => <FoodRowSkeleton key={i} />)}</div>
      ) : saved.length === 0 ? (
        <Empty
          title="No saved meals yet"
          body="Tap the heart on any dish to keep it here for next time."
          action={<Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-orange-strong px-5 font-bold text-white">Find something tasty</Link>}
        />
      ) : (
        <>
          <p className="-mt-2 text-[14px] text-muted-ink">{saved.length} saved {saved.length === 1 ? "meal" : "meals"}</p>
          <div className="grid gap-3 md:grid-cols-2">{saved.map((m) => <FoodRow key={m.id} item={m} trailing="fav" />)}</div>
        </>
      )}
    </main>
  );
}
