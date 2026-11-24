"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info, Store, Trash2 } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals, optionLabels, unitPrice } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { Button, Empty, ErrorState, FoodImage, PageHeader, Sheet, Skeleton, Stepper, inputClass } from "@/components/ui";
import { Summary } from "@/components/summary";

export default function CartPage() {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const t = cartTotals(state.cart, catalog.items, catalog.vendors, state.promoCode, state.orders.length);

  // Group lines by vendor, in the order vendors were first added.
  const groups = new Map<string, CartLine[]>();
  for (const l of state.cart) {
    const v = catalog.items.get(l.itemId)?.vendorId;
    if (!v) continue;
    groups.set(v, [...(groups.get(v) ?? []), l]);
  }
  const vendorFees = [...groups.keys()].map((id) => ({ name: catalog.vendors.get(id)?.name ?? "Vendor", fee: catalog.vendors.get(id)?.deliveryFee ?? 0 }));

  return (
    <main className="flex flex-col gap-6 px-5 pb-[calc(124px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pb-20 md:pt-10">
      <PageHeader
        title="Your cart"
        subtitle={t.count > 0 ? `${t.count} ${t.count === 1 ? "item" : "items"} from ${groups.size} ${groups.size === 1 ? "vendor" : "vendors"}` : undefined}
        right={
          state.cart.length > 0 && (
            <button onClick={() => setConfirmClear(true)} className="t-button min-h-11 px-2 text-green">
              Clear
            </button>
          )
        }
      />

      {catalog.state.status === "error" ? (
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      ) : catalog.state.status === "loading" ? (
        <Skeleton className="h-56 w-full" />
      ) : state.cart.length === 0 ? (
        <Empty
          title="Your cart is empty"
          body="Add a dish from Home or Search and it shows up here."
          action={
            <Link href="/" className="t-button inline-flex h-11 items-center rounded-full bg-orange-strong px-5 text-white hover:bg-orange-press">
              Browse food
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_380px] md:items-start md:gap-10">
          <div className="flex flex-col gap-5">
            {groups.size > 1 && (
              <p className="t-body flex gap-2.5 rounded-[var(--radius-tile)] bg-sage/70 px-4 py-3 text-ink">
                <Info className="mt-0.5 size-[18px] shrink-0 text-green" aria-hidden />
                Your food comes from {groups.size} kitchens, so it arrives as {groups.size} separate deliveries. Each one has its own delivery fee.
              </p>
            )}

            {[...groups.entries()].map(([vendorId, lines]) => {
              const vendor = catalog.vendors.get(vendorId);
              return (
                <section key={vendorId} aria-label={`From ${vendor?.name}`} className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-soft">
                  <header className="flex items-center gap-3 border-b border-line px-4 py-3">
                    <Store className="size-5 shrink-0 text-green" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <h2 className="t-card truncate text-ink">{vendor?.name}</h2>
                      <p className="t-support text-muted-ink">
                        Delivery {naira(vendor?.deliveryFee ?? 0)} · {vendor?.deliveryMinutes[0]}-{vendor?.deliveryMinutes[1]} min
                      </p>
                    </div>
                  </header>
                  <ul className="divide-y divide-line">
                    {lines.map((l) => {
                      const item = catalog.items.get(l.itemId)!;
                      const labels = optionLabels(item, l.optionIds);
                      const each = unitPrice(item, l.optionIds);
                      return (
                        <li key={l.key} className="flex flex-col gap-2.5 p-3.5">
                          <div className="flex gap-3">
                            <Link href={`/food/${item.id}`} className="shrink-0 rounded-[14px]">
                              <FoodImage photo={item.photo} sizes="72px" className="size-[72px] rounded-[14px]" />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <p className="t-card truncate text-ink">{item.name}</p>
                              {labels.length > 0 && <p className="t-support line-clamp-2 text-muted-ink">{labels.join(", ")}</p>}
                              <p className="t-price mt-1 text-[16px] text-ink">
                                {naira(each * l.qty)}
                                {l.qty > 1 && <span className="t-support ml-1.5 font-normal text-muted-ink">{naira(each)} each</span>}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                dispatch({ type: "removeLine", key: l.key });
                                toast(`Removed ${item.name}`);
                              }}
                              aria-label={`Remove ${item.name}`}
                              className="grid size-10 shrink-0 place-items-center rounded-full text-muted-ink transition-colors hover:bg-danger-soft hover:text-danger"
                            >
                              <Trash2 className="size-[18px]" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => setOpenNote(openNote === l.key ? null : l.key)}
                              aria-expanded={openNote === l.key}
                              className="t-support min-h-11 min-w-0 truncate text-left font-medium text-green"
                            >
                              {l.note ? `Note: ${l.note}` : "+ Special instructions"}
                            </button>
                            <Stepper size="sm" qty={l.qty} onChange={(q) => dispatch({ type: "setQty", key: l.key, qty: q })} name={item.name} />
                          </div>
                          {openNote === l.key && (
                            <textarea
                              autoFocus
                              rows={2}
                              value={l.note}
                              onChange={(e) => dispatch({ type: "setNote", key: l.key, note: e.target.value.slice(0, 160) })}
                              placeholder="Less pepper, no onions"
                              aria-label={`Special instructions for ${item.name}`}
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

          <aside className="flex flex-col gap-3 md:sticky md:top-[104px]" aria-label="Order summary">
            <h2 className="t-section hidden text-ink md:block">Summary</h2>
            <Summary totals={t} promoCode={state.promoCode} vendorFees={vendorFees} />
            {!state.promoCode && state.orders.length === 0 && <p className="t-support px-1 text-muted-ink">Have a promo code? Add it at checkout.</p>}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <Button size="lg" className="w-full" onClick={() => router.push("/checkout")}>
                Go to checkout · <span className="tabular">{naira(t.total)}</span>
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
