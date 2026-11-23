"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals, optionLabels, unitPrice } from "@/lib/pricing";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { Button, Empty, ErrorState, FoodImage, PageHeader, Skeleton, Stepper, inputClass } from "@/components/ui";
import { Summary } from "@/components/summary";

export default function CartPage() {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [openNote, setOpenNote] = useState<string | null>(null);
  const t = cartTotals(state.cart, catalog.items, catalog.vendors, state.promoCode, state.orders.length);

  return (
    <main className="flex flex-col gap-5 px-5 pb-[calc(120px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pb-16 md:pt-8">
      <PageHeader
        title="Your cart"
        right={
          state.cart.length > 0 && (
            <button
              onClick={() => {
                dispatch({ type: "clearCart" });
                toast("Cart cleared");
              }}
              className="min-h-11 px-2 text-sm font-semibold text-green"
            >
              Clear
            </button>
          )
        }
      />

      {catalog.state.status === "error" ? (
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      ) : catalog.state.status === "loading" ? (
        <Skeleton className="h-48 w-full" />
      ) : state.cart.length === 0 ? (
        <Empty
          title="Your cart is empty"
          body="Add a dish from Home or Search and it will show up here."
          action={
            <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-orange-strong px-5 font-bold text-white">
              Browse food
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_380px] md:items-start md:gap-8">
          <ul className="flex flex-col gap-3">
            {state.cart.map((l) => {
              const item = catalog.items.get(l.itemId);
              if (!item) return null;
              const labels = optionLabels(item, l.optionIds);
              return (
                <li key={l.key} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-3 shadow-soft">
                  <div className="flex gap-3">
                    <Link href={`/food/${item.id}`} className="shrink-0">
                      <FoodImage photo={item.photo} sizes="72px" className="size-[72px] rounded-[var(--radius-tile)]" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold text-ink">{item.name}</p>
                      <p className="truncate text-[13px] text-muted-ink">{catalog.vendors.get(item.vendorId)?.name}</p>
                      {labels.length > 0 && <p className="truncate text-[13px] text-muted-ink">{labels.join(", ")}</p>}
                      <p className="tabular mt-1 text-[15px] font-bold text-ink">
                        {naira(unitPrice(item, l.optionIds) * l.qty)}
                        {l.qty > 1 && <span className="ml-1.5 text-[12px] font-medium text-muted-ink">{naira(unitPrice(item, l.optionIds))} each</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        dispatch({ type: "removeLine", key: l.key });
                        toast(`Removed ${item.name}`);
                      }}
                      aria-label={`Remove ${item.name}`}
                      className="grid size-10 shrink-0 place-items-center rounded-full text-danger hover:bg-peach/60"
                    >
                      <Trash2 className="size-[18px]" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button onClick={() => setOpenNote(openNote === l.key ? null : l.key)} className="min-h-11 text-left text-[14px] font-semibold text-green">
                      {l.note ? `Note: ${l.note}` : "Add special instructions"}
                    </button>
                    <Stepper qty={l.qty} min={1} onChange={(q) => dispatch({ type: "setQty", key: l.key, qty: q })} name={item.name} />
                  </div>
                  {openNote === l.key && (
                    <textarea
                      autoFocus
                      rows={2}
                      value={l.note}
                      onChange={(e) => dispatch({ type: "setNote", key: l.key, note: e.target.value.slice(0, 160) })}
                      placeholder="For example: less pepper"
                      aria-label={`Special instructions for ${item.name}`}
                      className={`${inputClass} py-3`}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-4 md:sticky md:top-24">
            <Summary totals={t} promoCode={state.promoCode} />
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
              <Button size="lg" className="w-full" onClick={() => router.push("/checkout")}>
                Checkout · <span className="tabular">{naira(t.total)}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
