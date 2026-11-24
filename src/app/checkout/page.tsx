"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals, optionLabels, unitPrice } from "@/lib/pricing";
import { checkPromo } from "@/lib/promo";
import { PAYMENT_METHODS } from "@/lib/payments";
import type { Order, PaymentMethodId } from "@/lib/types";
import { newId, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet, formatAddress, validPhone } from "@/components/shell";
import { Summary } from "@/components/summary";
import { BoardHeading, Button, Empty, Field, PageHeader, Skeleton, TextInput, cx, inputClass } from "@/components/ui";

export default function CheckoutPage() {
  const { state, dispatch, address } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(state.profile?.name ?? "");
  const [phone, setPhone] = useState(state.profile?.phone ?? "");
  const [instructions, setInstructions] = useState("");
  const [payment, setPayment] = useState<PaymentMethodId>("pay_on_delivery");
  const [code, setCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [addrOpen, setAddrOpen] = useState(false);
  const [tried, setTried] = useState(false);
  const [placing, setPlacing] = useState(false);

  if (catalog.state.status !== "ready")
    return (
      <div className="px-5 pt-16">
        <Skeleton className="h-72 w-full" />
      </div>
    );
  if (state.cart.length === 0 && !placing)
    return (
      <main className="px-5 pt-[calc(env(safe-area-inset-top)+12px)] md:px-0 md:pt-8">
        <PageHeader title="Checkout" />
        <Empty title="Nothing to check out." body="Your cart is empty." action={<Link href="/" className="t-button text-green underline">See today&rsquo;s pots</Link>} />
      </main>
    );

  const t = cartTotals(state.cart, catalog.items, catalog.vendors, state.promoCode, state.orders.length);
  const vendorFees = t.vendorIds.map((id) => ({ name: catalog.vendors.get(id)?.name ?? "Vendor", fee: catalog.vendors.get(id)?.deliveryFee ?? 0 }));
  const errors = {
    name: !name.trim() ? "Enter the name the rider should ask for." : "",
    phone: !validPhone(phone) ? "Enter a Nigerian number, for example 0803 123 4567." : "",
    address: !address ? "Add a delivery address." : "",
  };
  const etaLo = Math.max(...t.vendorIds.map((v) => catalog.vendors.get(v)?.deliveryMinutes[0] ?? 30));
  const etaHi = Math.max(...t.vendorIds.map((v) => catalog.vendors.get(v)?.deliveryMinutes[1] ?? 45));

  const place = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean) || !address) {
      toast("Check the highlighted details", "error");
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPlacing(true);
    const id = newId();
    const order: Order = {
      id,
      reference: "FD-" + String(Date.now()).slice(-6),
      lines: state.cart.flatMap((l) => {
        const item = catalog.items.get(l.itemId);
        return item ? [{ itemId: item.id, name: item.name, vendorId: item.vendorId, qty: l.qty, unitPrice: unitPrice(item, l.optionIds), optionLabels: optionLabels(item, l.optionIds), note: l.note }] : [];
      }),
      vendorIds: t.vendorIds,
      subtotal: t.subtotal,
      deliveryFee: t.deliveryFee,
      discount: t.discount,
      total: t.total,
      promoCode: t.discount > 0 ? state.promoCode : null,
      paymentMethod: payment,
      address,
      contact: { name: name.trim(), phone: phone.trim(), instructions: instructions.trim() },
      placedAt: Date.now(),
      etaMinutes: [etaLo, etaHi],
    };
    router.replace(`/orders/${id}/placed`);
    dispatch({ type: "placeOrder", order });
    if (state.profile && !state.profile.phone) dispatch({ type: "updateProfile", patch: { phone: phone.trim() } });
  };

  return (
    <main className="px-5 pb-[calc(100px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+12px)] md:px-0 md:pb-20 md:pt-8">
      <PageHeader title="Checkout" subtitle={`Arrives in about ${etaLo}-${etaHi} minutes after the kitchen confirms.`} />
      <div className="mt-8 flex flex-col gap-10 md:grid md:grid-cols-[1fr_400px] md:items-start md:gap-14">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="addr-h">
            <BoardHeading id="addr-h">Deliver to</BoardHeading>
            <button
              onClick={() => setAddrOpen(true)}
              aria-invalid={tried && !!errors.address}
              className={cx("mt-1 flex w-full items-center gap-3 border-b border-line py-4 text-left", tried && errors.address && "border-danger")}
            >
              <span className="min-w-0 flex-1">
                {address ? (
                  <>
                    <span className="t-card block text-ink">{address.label}</span>
                    <span className="t-body block text-[15px] text-muted-ink">{formatAddress(address)}</span>
                  </>
                ) : (
                  <span className="t-card text-ink">Add a delivery address</span>
                )}
              </span>
              <span className="t-button shrink-0 text-green underline underline-offset-4">{address ? "Change" : "Add"}</span>
            </button>
            {tried && errors.address && <p className="t-support mt-2 text-danger">{errors.address}</p>}
            <div className="mt-4">
              <Field label="Notes for the rider" id="c-instr" hint="Optional. Gate colour, landmark, floor.">
                <textarea id="c-instr" className={`${inputClass} py-3`} rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value.slice(0, 200))} placeholder="Blue gate opposite the mosque" />
              </Field>
            </div>
          </section>

          <section aria-labelledby="info-h">
            <BoardHeading id="info-h">Contact</BoardHeading>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" id="c-name" error={tried ? errors.name : ""}>
                <TextInput id="c-name" error={tried ? errors.name : ""} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Phone number" id="c-phone" error={tried ? errors.phone : ""}>
                <TextInput id="c-phone" error={tried ? errors.phone : ""} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" />
              </Field>
            </div>
          </section>

          <section aria-labelledby="pay-h">
            <BoardHeading id="pay-h">Payment</BoardHeading>
            <div role="radiogroup" aria-labelledby="pay-h">
              {PAYMENT_METHODS.map((m) => {
                const on = payment === m.id;
                return (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={on}
                    disabled={!m.available}
                    onClick={() => setPayment(m.id)}
                    className={cx("flex min-h-[68px] w-full items-center gap-3 border-b border-dashed border-leader text-left", !m.available && "cursor-not-allowed")}
                  >
                    <span className={cx("grid size-[22px] shrink-0 place-items-center rounded-full border-2", on ? "border-green bg-green text-white" : m.available ? "border-ink/50" : "border-line")}>
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cx("t-card block", m.available ? "text-ink" : "text-muted-ink")}>{m.label}</span>
                      <span className="t-support block text-muted-ink">{m.detail}</span>
                    </span>
                    {!m.available && <span className="t-support shrink-0 font-semibold text-muted-ink">Soon</span>}
                  </button>
                );
              })}
            </div>
            <p className="t-support mt-3 text-muted-ink">Nothing is charged in the app. You pay the rider when your food arrives.</p>
          </section>

          <section aria-labelledby="sum-h">
            <BoardHeading id="sum-h">Your order</BoardHeading>
            {t.vendorIds.map((vid) => (
              <div key={vid} className="pt-4">
                <p className="t-support font-semibold text-burnt-ink">From {catalog.vendors.get(vid)?.name}</p>
                <ul>
                  {state.cart
                    .filter((l) => catalog.items.get(l.itemId)?.vendorId === vid)
                    .map((l) => {
                      const item = catalog.items.get(l.itemId)!;
                      const labels = optionLabels(item, l.optionIds);
                      return (
                        <li key={l.key} className="border-b border-dashed border-leader py-2.5">
                          <span className="flex items-baseline gap-2 text-[16px] text-ink">
                            <span className="min-w-0 truncate font-semibold">
                              {l.qty}x {item.name}
                            </span>
                            <span aria-hidden className="leader" />
                            <span className="tabular shrink-0">{naira(unitPrice(item, l.optionIds) * l.qty)}</span>
                          </span>
                          {(labels.length > 0 || l.note) && (
                            <span className="t-support block text-muted-ink">
                              {labels.join(", ")}
                              {labels.length && l.note ? " · " : ""}
                              {l.note && `“${l.note}”`}
                            </span>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </section>
        </div>

        <aside className="flex flex-col gap-8 md:sticky md:top-[104px]" aria-label="Total">
          <section aria-labelledby="promo-h">
            <BoardHeading id="promo-h">Promo code</BoardHeading>
            {state.promoCode && t.discount > 0 ? (
              <div role="status" className="mt-3 flex items-center justify-between gap-3">
                <span className="t-body text-[15px] text-ink">
                  <strong className="font-[family-name:var(--font-display)] font-extrabold tracking-[0.04em] text-green">{state.promoCode}</strong> applied. You save <span className="tabular font-semibold">{naira(t.discount)}</span>.
                </span>
                <button onClick={() => dispatch({ type: "setPromo", code: null })} className="t-button min-h-11 shrink-0 text-green underline underline-offset-4">
                  Remove
                </button>
              </div>
            ) : (
              <form
                className="mt-3 flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const r = checkPromo(code, state.orders.length);
                  if (r.ok) {
                    dispatch({ type: "setPromo", code: r.promo.code });
                    setCode("");
                    setPromoError("");
                    toast(`${r.promo.code} applied`);
                  } else setPromoError(r.error);
                }}
              >
                <div className="flex gap-2">
                  <input
                    className={cx(inputClass, "uppercase placeholder:normal-case")}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setPromoError("");
                    }}
                    placeholder="Enter code"
                    aria-label="Promo code"
                    autoCapitalize="characters"
                    aria-invalid={promoError ? true : undefined}
                    aria-describedby={promoError ? "promo-err" : undefined}
                  />
                  <Button type="submit" variant="green" disabled={!code.trim()} className="min-h-12">
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p id="promo-err" role="alert" className="t-support text-danger">
                    {promoError}
                  </p>
                )}
              </form>
            )}
          </section>

          <Summary totals={t} promoCode={state.promoCode} vendorFees={vendorFees} />

          <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-cream px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
            <Button size="lg" className="w-full" onClick={place} loading={placing}>
              {placing ? "Placing order" : <>Place order · <span className="tabular">{naira(t.total)}</span></>}
            </Button>
          </div>
        </aside>
      </div>
      {addrOpen && <AddressSheet onClose={() => setAddrOpen(false)} />}
    </main>
  );
}
