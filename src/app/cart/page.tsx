"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { naira } from "@/lib/format";
import { cartTotals, optionLabels, unitPrice } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { BoardHeading, Button, Empty, ErrorState, PageHeader, Sheet, Skeleton, Stepper, inputClass } from "@/components/ui";
import { Summary } from "@/components/summary";

export default function CartPage() {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const t = cartTotals(state.cart, catalog.items, catalog.vendors, state.promoCode, state.orders.length);

  const groups = new Map<string, CartLine[]>();
  for (const l of state.cart) {
    const v = catalog.items.get(l.itemId)?.vendorId;
    if (v) groups.set(v, [...(groups.get(v) ?? []), l]);
  }
  const vendorFees = [...groups.keys()].map((id) => ({ name: catalog.vendors.get(id)?.name ?? "Vendor", fee: catalog.vendors.get(id)?.deliveryFee ?? 0 }));

  return (
    <main className="px-5 pb-[calc(100px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+12px)] md:px-0 md:pb-20 md:pt-8">
      <PageHeader
        title="Your cart"
        subtitle={t.count > 0 ? `${t.count} ${t.count === 1 ? "item" : "items"} from ${groups.size} ${groups.size === 1 ? "kitchen" : "kitchens"}` : undefined}
        right={
          state.cart.length > 0 && (
            <button onClick={() => setConfirmClear(true)} className="t-button min-h-11 px-1 text-green">
              Clear all
            </button>
          )
        }
      />

      {catalog.state.status === "error" ? (
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      ) : catalog.state.status === "loading" ? (
        <Skeleton className="mt-6 h-56 w-full" />
      ) : state.cart.length === 0 ? (
        <Empty
          title="Your cart is empty."
          body="Add a dish from the board on Home, or search for one."
          action={
            <Link href="/" className="t-button inline-flex h-11 items-center rounded-[6px] bg-orange-strong px-4 text-white hover:bg-orange-press">
              See today&rsquo;s pots
            </Link>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-10 md:grid md:grid-cols-[1fr_380px] md:items-start md:gap-14">
          <div className="flex flex-col gap-9">
            {groups.size > 1 && (
              <p className="t-body text-[15px] text-ink">
                Your food comes from <strong className="font-semibold">{groups.size} kitchens</strong>, so it arrives as {groups.size} separate deliveries, each with its own delivery fee.
              </p>
            )}

            {[...groups.entries()].map(([vendorId, lines]) => {
              const vendor = catalog.vendors.get(vendorId);
              return (
                <section key={vendorId} aria-label={`From ${vendor?.name}`}>
                  <BoardHeading action={<span className="t-support pb-1 text-muted-ink">{vendor?.deliveryMinutes[0]}-{vendor?.deliveryMinutes[1]} min</span>}>{vendor?.name}</BoardHeading>
                  <ul>
                    {lines.map((l) => {
                      const item = catalog.items.get(l.itemId)!;
                      const labels = optionLabels(item, l.optionIds);
                      const each = unitPrice(item, l.optionIds);
                      return (
                        <li key={l.key} className="flex flex-col gap-2 border-b border-dashed border-leader py-4">
                          <Link href={`/food/${item.id}`} className="flex items-baseline gap-2 font-[family-name:var(--font-display)] text-[17px] font-bold tracking-[-0.01em] text-ink">
                            <span className="min-w-0 truncate">{item.name}</span>
                            <span aria-hidden className="leader" />
                            <span className="tabular shrink-0">{naira(each * l.qty)}</span>
                          </Link>
                          {(labels.length > 0 || l.qty > 1) && (
                            <p className="t-support -mt-1 text-muted-ink">
                              {labels.join(", ")}
                              {labels.length > 0 && l.qty > 1 ? " · " : ""}
                              {l.qty > 1 && `${naira(each)} each`}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            <Stepper qty={l.qty} min={1} onChange={(q) => dispatch({ type: "setQty", key: l.key, qty: q })} name={item.name} />
                            <button onClick={() => setOpenNote(openNote === l.key ? null : l.key)} aria-expanded={openNote === l.key} className="t-support min-h-11 min-w-0 flex-1 truncate text-left font-semibold text-green">
                              {l.note ? `“${l.note}”` : "Add a note"}
                            </button>
                            <button
                              onClick={() => {
                                dispatch({ type: "removeLine", key: l.key });
                                toast(`Removed ${item.name}`);
                              }}
                              className="t-support min-h-11 shrink-0 font-semibold text-danger"
                            >
                              Remove
                            </button>
                          </div>
                          {openNote === l.key && (
                            <textarea
                              autoFocus
                              rows={2}
                              value={l.note}
                              onChange={(e) => dispatch({ type: "setNote", key: l.key, note: e.target.value.slice(0, 160) })}
                              placeholder="Less pepper, no onions"
                              aria-label={`Note for ${item.name}`}
                              className={`${inputClass} py-3`}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <aside className="flex flex-col gap-4 md:sticky md:top-[104px]" aria-label="Order summary">
            <Summary totals={t} promoCode={state.promoCode} vendorFees={vendorFees} />
            {!state.promoCode && state.orders.length === 0 && <p className="t-support text-muted-ink">Promo code? Add it at checkout.</p>}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-cream px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
              <Button size="lg" className="w-full" onClick={() => router.push("/checkout")}>
                Checkout · <span className="tabular">{naira(t.total)}</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {confirmClear && (
        <Sheet
          title="Clear your cart?"
          onClose={() => setConfirmClear(false)}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmClear(false)}>
                Keep items
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  dispatch({ type: "clearCart" });
                  setConfirmClear(false);
                  toast("Cart cleared");
                }}
              >
                Clear cart
              </Button>
            </div>
          }
        >
          <p className="t-body text-[15px] text-muted-ink">This removes all {t.count} items. You can add them again from the menu.</p>
        </Sheet>
      )}
    </main>
  );
}
