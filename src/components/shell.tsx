"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Heart, House, ReceiptText, Search, ShoppingBag, UserRound, Check, Pencil, Trash2, Plus } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals } from "@/lib/pricing";
import type { Address } from "@/lib/types";
import { newId, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { Button, Field, Logo, Sheet, cx, inputClass } from "./ui";

const NAV = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/orders", label: "Orders", Icon: ReceiptText },
  { href: "/favourites", label: "Favourites", Icon: Heart },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));
/** Screens with their own bottom action bar hide the tab bar. */
const FULL_SCREEN = [/^\/cart/, /^\/checkout/, /^\/food\//];

function useCartSummary() {
  const { state } = useStore();
  const { items, vendors } = useCatalog();
  return cartTotals(state.cart, items, vendors, state.promoCode, state.orders.length);
}

export function BottomNav() {
  const path = usePathname();
  const totals = useCartSummary();
  if (FULL_SCREEN.some((r) => r.test(path))) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2.5 px-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] md:hidden">
      {totals.count > 0 && (
        <Link
          href="/cart"
          className="pointer-events-auto flex min-h-[54px] w-full max-w-md items-center gap-3 rounded-full bg-green px-5 text-[15px] font-semibold text-white shadow-float"
        >
          <ShoppingBag className="size-5 text-orange" />
          <span className="flex-1">
            View cart · {totals.count} {totals.count === 1 ? "item" : "items"}
          </span>
          <span className="tabular font-bold">{naira(totals.subtotal)}</span>
        </Link>
      )}
      <nav aria-label="Main" className="pointer-events-auto flex w-full max-w-md justify-between rounded-full bg-surface px-2.5 py-2 shadow-float">
        {NAV.map(({ href, label, Icon }) => {
          const on = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cx("flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold", on ? "text-green" : "text-muted-ink")}
            >
              <Icon className={cx("size-6", on && "text-orange")} fill={on && label !== "Search" ? "currentColor" : "none"} strokeWidth={on ? 2.2 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function TopNav() {
  const path = usePathname();
  const totals = useCartSummary();
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-cream/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-8">
        <Link href="/" aria-label="Foodie home">
          <Logo size={36} />
        </Link>
        <nav aria-label="Main" className="ml-4 flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const on = isActive(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cx("rounded-full px-4 py-2 text-[15px] font-semibold transition-colors", on ? "bg-sage text-green" : "text-muted-ink hover:text-green")}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <Link href="/cart" className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-green px-5 text-[15px] font-semibold text-white">
          <ShoppingBag className="size-5 text-orange" />
          Cart
          {totals.count > 0 && <span className="tabular rounded-full bg-orange-strong px-2 py-0.5 text-[13px]">{totals.count}</span>}
        </Link>
      </div>
    </header>
  );
}

export function AddressForm({ initial, onSave, submitLabel }: { initial?: Address; onSave: (a: Address) => void; submitLabel: string }) {
  const [label, setLabel] = useState(initial?.label ?? "Home");
  const [line, setLine] = useState(initial?.line ?? "");
  const [area, setArea] = useState(initial?.area ?? "Alabata");
  const [city, setCity] = useState(initial?.city ?? "Abeokuta");
  const valid = line.trim().length > 2 && area.trim() && city.trim();
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave({ id: initial?.id ?? newId(), label: label.trim() || "Home", line: line.trim(), area: area.trim(), city: city.trim() });
      }}
    >
      <div className="flex gap-2">
        {["Home", "Work", "Other"].map((l) => (
          <button
            type="button"
            key={l}
            onClick={() => setLabel(l)}
            aria-pressed={label === l}
            className={cx("min-h-10 rounded-full px-4 text-sm font-semibold", label === l ? "bg-green text-white" : "bg-cream text-green")}
          >
            {l}
          </button>
        ))}
      </div>
      <Field label="Street and house number">
        <input className={inputClass} value={line} onChange={(e) => setLine(e.target.value)} placeholder="House number and street name" autoComplete="address-line1" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Area">
          <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} autoComplete="address-level3" required />
        </Field>
        <Field label="City">
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" required />
        </Field>
      </div>
      <Button type="submit" size="lg" disabled={!valid}>
        {submitLabel}
      </Button>
    </form>
  );
}

export const formatAddress = (a: Address) => `${a.line}, ${a.area}, ${a.city}`;

/** Pick a saved address or add one. */
export function AddressSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Address | "new" | null>(state.addresses.length ? null : "new");
  return (
    <Sheet title={editing ? (editing === "new" ? "Add an address" : "Edit address") : "Deliver to"} onClose={onClose}>
      {editing ? (
        <AddressForm
          initial={editing === "new" ? undefined : editing}
          submitLabel="Save address"
          onSave={(a) => {
            dispatch({ type: "saveAddress", address: a });
            dispatch({ type: "selectAddress", id: a.id });
            toast("Address saved");
            setEditing(null);
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Saved addresses">
            {state.addresses.map((a) => {
              const on = a.id === state.selectedAddressId;
              return (
                <li key={a.id} className={cx("flex items-center gap-2 rounded-[var(--radius-tile)] p-1 pr-2", on ? "bg-sage" : "bg-cream")}>
                  <button
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      dispatch({ type: "selectAddress", id: a.id });
                      onClose();
                    }}
                    className="flex min-h-14 flex-1 items-center gap-3 rounded-[12px] px-3 text-left"
                  >
                    <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border-2", on ? "border-green bg-green text-white" : "border-muted")}>
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{a.label}</span>
                      <span className="block truncate text-[14px] text-muted-ink">{formatAddress(a)}</span>
                    </span>
                  </button>
                  <button onClick={() => setEditing(a)} aria-label={`Edit ${a.label} address`} className="grid size-10 place-items-center rounded-full text-green">
                    <Pencil className="size-4" />
                  </button>
                  {state.addresses.length > 1 && (
                    <button
                      onClick={() => {
                        dispatch({ type: "removeAddress", id: a.id });
                        toast("Address removed");
                      }}
                      aria-label={`Remove ${a.label} address`}
                      className="grid size-10 place-items-center rounded-full text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Button variant="secondary" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add a new address
          </Button>
        </div>
      )}
    </Sheet>
  );
}

/** First visit: ask for the name and the delivery address. Nothing is sent anywhere. */
function Welcome() {
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[calc(env(safe-area-inset-top)+40px)]">
      <div className="flex flex-col items-center text-center">
        <Logo size={120} withWord={false} />
        <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-green">Foodie</h1>
        <p className="mt-1 text-[16px] text-muted-ink">Nigerian food from kitchens near you, delivered.</p>
      </div>
      <div className="mt-10 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        {step === 1 ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setStep(2);
            }}
          >
            <h2 className="text-[20px] font-bold text-ink">What should we call you?</h2>
            <Field label="First name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" autoFocus required />
            </Field>
            <Field label="Phone number" hint="Your rider calls this number on arrival.">
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="080..." />
            </Field>
            <Button type="submit" size="lg" disabled={!name.trim()}>
              Continue
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-ink">Where should we deliver?</h2>
            <AddressForm
              submitLabel="Start ordering"
              onSave={(address) =>
                dispatch({ type: "signIn", profile: { name: name.trim(), phone: phone.trim(), photo: null, preferredPayment: "pay_on_delivery" }, address })
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="min-h-dvh" aria-busy="true" />;
  if (!state.profile) return <Welcome />;
  return (
    <>
      <TopNav />
      <div className="mx-auto w-full max-w-6xl md:px-8">{children}</div>
      <BottomNav />
    </>
  );
}
