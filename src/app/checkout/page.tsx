"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banknote, Check, CreditCard, Landmark, MapPin } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals, optionLabels, unitPrice } from "@/lib/pricing";
import { checkPromo } from "@/lib/promo";
import { PAYMENT_METHODS } from "@/lib/payments";
import type { Order, PaymentMethodId } from "@/lib/types";
import { newId, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet, formatAddress } from "@/components/shell";
import { Summary } from "@/components/summary";
import { Button, Empty, Field, PageHeader, Skeleton, cx, inputClass } from "@/components/ui";

const ICONS = { pay_on_delivery: Banknote, card: CreditCard, bank_transfer: Landmark };
const validPhone = (p: string) => /^(\+?234|0)[789][01]\d{8}$/.test(p.replace(/[\s-]/g, ""));

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
  const [touched, setTouched] = useState(false);
  const [placing, setPlacing] = useState(false);

  if (catalog.state.status !== "ready") return <div className="px-5 pt-16"><Skeleton className="h-64 w-full" /></div>;
  if (state.cart.length === 0)
    return (
      <main className="flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pt-8">
        <PageHeader title="Checkout" />
        <Empty title="Nothing to check out" body="Your cart is empty." action={<Link href="/" className="font-semibold text-green">Browse food</Link>} />
      </main>
    );

  const t = cartTotals(state.cart, catalog.items, catalog.vendors, state.promoCode, state.orders.length);
  const errors = {
    name: !name.trim() ? "Enter the name the rider should ask for." : "",
    phone: !validPhone(phone) ? "Enter a Nigerian phone number, for example 08031234567." : "",
    address: !address ? "Add a delivery address." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const etaHi = Math.max(...t.vendorIds.map((v) => catalog.vendors.get(v)?.deliveryMinutes[1] ?? 45));
  const etaLo = Math.max(...t.vendorIds.map((v) => catalog.vendors.get(v)?.deliveryMinutes[0] ?? 30));

  const place = () => {
    setTouched(true);
    if (hasErrors || !address) return toast("Check the highlighted fields", "error");
    setPlacing(true);
    const id = newId();
    const order: Order = {
      id,
      reference: "FD-" + String(Date.now()).slice(-6),
      lines: state.cart.flatMap((l) => {
        const item = catalog.items.get(l.itemId);
        return item
          ? [{ itemId: item.id, name: item.name, vendorId: item.vendorId, qty: l.qty, unitPrice: unitPrice(item, l.optionIds), optionLabels: optionLabels(item, l.optionIds), note: l.note }]
          : [];
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
    dispatch({ type: "placeOrder", order });
    if (state.profile && !state.profile.phone) dispatch({ type: "updateProfile", patch: { phone: phone.trim() } });
    router.replace(`/orders/${id}`);
  };

  const card = "flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft";
  const h2 = "text-[18px] font-bold text-ink";

  return (
    <main className="flex flex-col gap-5 px-5 pb-[calc(120px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+16px)] md:px-0 md:pb-16 md:pt-8">
      <PageHeader title="Checkout" />
      <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_380px] md:items-start md:gap-8">
        <div className="flex flex-col gap-5">
          <section className={card} aria-labelledby="addr-h">
            <h2 id="addr-h" className={h2}>Delivery address</h2>
            <button onClick={() => setAddrOpen(true)} className="flex items-center gap-3 rounded-[var(--radius-tile)] bg-cream p-3.5 text-left">
              <MapPin className="size-5 shrink-0 text-orange" />
              <span className="min-w-0 flex-1">
                {address ? (
                  <>
                    <span className="block font-semibold text-ink">{address.label}</span>
                    <span className="block text-[14px] text-muted-ink">{formatAddress(address)}</span>
                  </>
                ) : (
                  <span className="font-semibold text-ink">Add a delivery address</span>
                )}
              </span>
              <span className="text-sm font-semibold text-green">Change</span>
            </button>
            {touched && errors.address && <p className="text-sm text-danger">{errors.address}</p>}
          </section>

          <section className={card} aria-labelledby="info-h">
            <h2 id="info-h" className={h2}>Delivery information</h2>
            <Field label="Name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={touched && !!errors.name} />
            </Field>
            {touched && errors.name && <p className="-mt-2 text-sm text-danger">{errors.name}</p>}
            <Field label="Phone number">
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="08031234567" aria-invalid={touched && !!errors.phone} />
            </Field>
            {touched && errors.phone && <p className="-mt-2 text-sm text-danger">{errors.phone}</p>}
            <Field label="Delivery instructions" hint="Optional">
              <textarea className={`${inputClass} py-3`} rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value.slice(0, 200))} placeholder="Gate colour, landmark, floor" />
            </Field>
          </section>

          <section className={card} aria-labelledby="sum-h">
            <h2 id="sum-h" className={h2}>Order summary</h2>
            <ul className="flex flex-col gap-2.5">
              {state.cart.map((l) => {
                const item = catalog.items.get(l.itemId);
                if (!item) return null;
                const labels = optionLabels(item, l.optionIds);
                return (
                  <li key={l.key} className="flex justify-between gap-4 text-[15px]">
                    <span className="min-w-0">
                      <span className="font-semibold text-ink">
                        {l.qty}x {item.name}
                      </span>
                      <span className="block truncate text-[13px] text-muted-ink">
                        {catalog.vendors.get(item.vendorId)?.name}
                        {labels.length ? ` · ${labels.join(", ")}` : ""}
                        {l.note ? ` · "${l.note}"` : ""}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-ink">{naira(unitPrice(item, l.optionIds) * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-[13px] text-muted-ink">
              Estimated delivery {etaLo}-{etaHi} min after the vendor confirms.
            </p>
          </section>

          <section className={card} aria-labelledby="pay-h">
            <h2 id="pay-h" className={h2}>Payment method</h2>
            <div role="radiogroup" aria-labelledby="pay-h" className="flex flex-col gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = ICONS[m.id];
                const on = payment === m.id;
                return (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={on}
                    disabled={!m.available}
                    onClick={() => setPayment(m.id)}
                    className={cx("flex min-h-16 items-center gap-3 rounded-[var(--radius-tile)] px-4 text-left", on ? "bg-sage" : "bg-cream", !m.available && "opacity-60")}
                  >
                    <Icon className="size-5 shrink-0 text-green" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{m.label}</span>
                      <span className="block text-[13px] text-muted-ink">{m.detail}</span>
                    </span>
                    {m.available ? (
                      <span className={cx("grid size-5 place-items-center rounded-full border-2", on ? "border-green bg-green text-white" : "border-muted")}>{on && <Check className="size-3" strokeWidth={3} />}</span>
                    ) : (
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-semibold text-muted-ink">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={card} aria-labelledby="promo-h">
            <h2 id="promo-h" className={h2}>Promo code</h2>
            {state.promoCode && t.discount > 0 ? (
              <div className="flex items-center justify-between gap-3 rounded-[var(--radius-tile)] bg-sage px-4 py-3">
                <span className="text-[15px] text-ink">
                  <strong>{state.promoCode}</strong> applied. You save <span className="tabular font-semibold">{naira(t.discount)}</span>.
                </span>
                <button onClick={() => dispatch({ type: "setPromo", code: null })} className="min-h-11 text-sm font-semibold text-green">
                  Remove
                </button>
              </div>
            ) : (
              <form
                className="flex gap-2"
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
                <input
                  className={inputClass}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setPromoError("");
                  }}
                  placeholder="Enter code"
                  aria-label="Promo code"
                  autoCapitalize="characters"
                  aria-invalid={!!promoError}
                  aria-describedby={promoError ? "promo-err" : undefined}
                />
                <Button type="submit" variant="green" disabled={!code.trim()} className="min-h-12">
                  Apply
                </Button>
              </form>
            )}
            {promoError && (
              <p id="promo-err" role="alert" className="text-sm text-danger">
                {promoError}
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4 md:sticky md:top-24">
          <Summary totals={t} promoCode={state.promoCode} />
          <p className="text-[13px] leading-relaxed text-muted-ink">
            Pay the rider when your food arrives. Nothing is charged in the app.
          </p>
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
            <Button size="lg" className="w-full" onClick={place} disabled={placing}>
              {placing ? "Placing order..." : <>Place order · <span className="tabular">{naira(t.total)}</span></>}
            </Button>
          </div>
        </div>
      </div>
      {addrOpen && <AddressSheet onClose={() => setAddrOpen(false)} />}
    </main>
  );
}
