"use client";

import Link from "next/link";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { DishRow, DishRowSkeleton } from "@/components/food";
import { Empty, ErrorState, PageHeader } from "@/components/ui";

/** Your own board: the dishes you keep coming back to. */
export default function SavedPage() {
  const { state } = useStore();
  const catalog = useCatalog();
  const saved = state.favourites.map((id) => catalog.items.get(id)).filter((m) => m !== undefined);
  return (
    <main className="pb-nav px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:mx-auto md:w-full md:max-w-3xl md:px-0 md:pt-10">
      <PageHeader
        title="Saved"
        back={false}
        subtitle={saved.length > 0 ? `Your board: ${saved.length} ${saved.length === 1 ? "dish" : "dishes"} you keep coming back to.` : undefined}
      />
      <div className="mt-6 border-t-2 border-ink">
        {catalog.state.status === "error" ? (
          <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
        ) : catalog.state.status === "loading" ? (
          [0, 1, 2].map((i) => <DishRowSkeleton key={i} />)
        ) : saved.length === 0 ? (
          <Empty
            title="Nothing saved yet."
            body="Tap the heart on any dish and it goes on your board, one tap from the cart."
            action={
              <Link href="/" className="t-button inline-flex h-11 items-center rounded-[6px] bg-orange-strong px-4 text-white hover:bg-orange-press">
                See today&rsquo;s pots
              </Link>
            }
          />
        ) : (
          <ul>
            {saved.map((m) => (
              <DishRow key={m.id} item={m} trailing="saved" />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
