"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Check, Heart, House, Pencil, Plus, ReceiptText, Search, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals } from "@/lib/pricing";
import type { Address } from "@/lib/types";
import { newId, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { Button, Choice, Field, Sheet, TextInput, Wordmark, cx } from "./ui";

const NAV = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/orders", label: "Orders", Icon: ReceiptText },
  { href: "/favourites", label: "Saved", Icon: Heart },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));
/** Screens with their own bottom action bar hide the tab bar. */
const FULL_SCREEN = [/^\/cart/, /^\/checkout/, /^\/food\//, /^\/orders\/[^/]+\/placed/];

export const validPhone = (p: string) => /^(\+?234|0)[789][01]\d{8}$/.test(p.replace(/[\s-]/g, ""));

function useCartSummary() {
  const { state } = useStore();
  const { items, vendors } = useCatalog();
  return cartTotals(state.cart, items, vendors, state.promoCode, state.orders.length);
}

/** Flat tab bar with a hairline, like the bottom of a printed menu. Cart sits on it as a green strip. */
export function BottomNav() {
  const path = usePathname();
  const totals = useCartSummary();
  if (FULL_SCREEN.some((r) => r.test(path))) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      {totals.count > 0 && (
        <Link href="/cart" className="flex h-[52px] items-center gap-3 bg-green px-5 text-white transition-colors active:bg-green-deep">
          <ShoppingBag key={totals.count} className="animate-bump size-5 shrink-0 text-orange" aria-hidden />
          <span className="flex-1 text-[15px] font-semibold">
            View cart · {totals.count} {totals.count === 1 ? "item" : "items"}
          </span>
          <span className="tabular font-[family-name:var(--font-display)] text-[18px] font-bold">{naira(totals.subtotal)}</span>
        </Link>
      )}
      <nav aria-label="Main" className="flex border-t border-line bg-cream pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ href, label, Icon }) => {
          const on = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cx("t-nav relative flex h-[60px] flex-1 flex-col items-center justify-center gap-1 text-[11.5px] transition-colors", on ? "text-green" : "text-muted-ink")}
            >
              <span aria-hidden className={cx("absolute inset-x-5 top-0 h-[3px]", on ? "bg-burnt" : "bg-transparent")} />
              <Icon className="size-[22px]" strokeWidth={on ? 2.4 : 1.8} aria-hidden />
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
    <header className="sticky top-0 z-30 hidden border-b-2 border-ink bg-cream md:block">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-8 px-8">
        <Link href="/" aria-label="Foodie home" className="rounded-[6px]">
          <Wordmark className="text-[30px]" />
        </Link>
        <nav aria-label="Main" className="flex h-full items-stretch gap-6">
          {NAV.map(({ href, label }) => {
            const on = isActive(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cx("relative flex items-center text-[15px] font-semibold transition-colors", on ? "text-ink" : "text-muted-ink hover:text-ink")}
              >
                {label}
                <span aria-hidden className={cx("absolute inset-x-0 -bottom-[2px] h-[3px]", on ? "bg-burnt" : "bg-transparent")} />
              </Link>
            );
          })}
        </nav>
        <Link href="/cart" className="t-button ml-auto inline-flex h-11 items-center gap-2 rounded-[6px] bg-green px-4 text-white transition-colors hover:bg-green-deep">
          <ShoppingBag className="size-[18px] text-orange" aria-hidden />
          Cart
          {totals.count > 0 && (
            <span key={totals.count} className="animate-bump tabular font-[family-name:var(--font-display)] text-[16px]">
              · {naira(totals.subtotal)}
            </span>
          )}
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
  const [tried, setTried] = useState(false);
  const errors = {
    line: line.trim().length < 3 ? "Enter your house number and street." : "",
    area: !area.trim() ? "Enter your area." : "",
    city: !city.trim() ? "Enter your city." : "",
  };
  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (Object.values(errors).some(Boolean)) return;
        onSave({ id: initial?.id ?? newId(), label, line: line.trim(), area: area.trim(), city: city.trim() });
      }}
    >
      <div role="radiogroup" aria-label="Address label" className="flex gap-2">
        {["Home", "Work", "Other"].map((l) => (
          <Choice key={l} active={label === l} onClick={() => setLabel(l)}>
            {l}
          </Choice>
        ))}
      </div>
      <Field label="Street and house number" id="addr-line" error={tried ? errors.line : ""}>
        <TextInput id="addr-line" error={tried ? errors.line : ""} value={line} onChange={(e) => setLine(e.target.value)} placeholder="12 Olorunsogo Street" autoComplete="address-line1" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Area" id="addr-area" error={tried ? errors.area : ""}>
          <TextInput id="addr-area" error={tried ? errors.area : ""} value={area} onChange={(e) => setArea(e.target.value)} autoComplete="address-level3" />
        </Field>
        <Field label="City" id="addr-city" error={tried ? errors.city : ""}>
          <TextInput id="addr-city" error={tried ? errors.city : ""} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
        </Field>
      </div>
      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}

export const formatAddress = (a: Address) => `${a.line}, ${a.area}, ${a.city}`;

/** Pick a saved address, edit one, or add one. */
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
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col" role="radiogroup" aria-label="Saved addresses">
            {state.addresses.map((a) => {
              const on = a.id === state.selectedAddressId;
              return (
                <li key={a.id} className="flex items-center gap-1 border-b border-line">
                  <button
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      dispatch({ type: "selectAddress", id: a.id });
                      onClose();
                    }}
                    className="flex min-h-16 min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border-2", on ? "border-green bg-green text-white" : "border-muted")}>
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="t-card block text-ink">{a.label}</span>
                      <span className="t-support block truncate text-muted-ink">{formatAddress(a)}</span>
                    </span>
                  </button>
                  <button onClick={() => setEditing(a)} aria-label={`Edit ${a.label} address`} className="grid size-10 place-items-center rounded-[6px] text-green hover:bg-board/60">
                    <Pencil className="size-4" />
                  </button>
                  {state.addresses.length > 1 && (
                    <button
                      onClick={() => {
                        dispatch({ type: "removeAddress", id: a.id });
                        toast("Address removed");
                      }}
                      aria-label={`Remove ${a.label} address`}
                      className="grid size-10 place-items-center rounded-[6px] text-danger hover:bg-danger-soft"
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

/** First visit: name and phone, then where to deliver. Saved on this device only. */
function Welcome() {
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const errors = {
    name: !name.trim() ? "Tell us your first name." : "",
    phone: !validPhone(phone) ? "Enter a Nigerian number, for example 0803 123 4567." : "",
  };
  return (
    <main className="animate-page mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[calc(env(safe-area-inset-top)+40px)]">
      <Wordmark className="text-[64px] leading-[0.9]" />
      <p className="mt-3 max-w-[300px] font-[family-name:var(--font-display)] text-[24px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
        Nigerian food from <span className="text-burnt-ink">kitchens near you.</span>
      </p>

      <section className="mt-10 border-t-2 border-ink pt-5" aria-labelledby="welcome-h">
        <div role="progressbar" aria-label="Sign up progress" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step} className="mb-5 flex gap-1.5">
          {[1, 2].map((n) => (
            <span key={n} className={cx("h-1 flex-1 transition-colors duration-300", n <= step ? "bg-burnt" : "bg-line")} />
          ))}
        </div>
        {step === 1 ? (
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setTried(true);
              if (!errors.name && !errors.phone) setStep(2);
            }}
          >
            <h1 id="welcome-h" className="t-section text-ink">
              What should we call you?
            </h1>
            <Field label="First name" id="w-name" error={tried ? errors.name : ""}>
              <TextInput id="w-name" error={tried ? errors.name : ""} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label="Phone number" id="w-phone" hint="Your rider calls this number when they arrive." error={tried ? errors.phone : ""}>
              <TextInput id="w-phone" error={tried ? errors.phone : ""} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" />
            </Field>
            <Button type="submit" size="lg" className="mt-1">
              Continue
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <h1 id="welcome-h" className="t-section text-ink">
              Where should we deliver, {name.trim().split(" ")[0]}?
            </h1>
            <AddressForm
              submitLabel="Start ordering"
              onSave={(address) =>
                dispatch({ type: "signIn", profile: { name: name.trim(), phone: phone.trim(), photo: null, preferredPayment: "pay_on_delivery" }, address })
              }
            />
            <button onClick={() => setStep(1)} className="t-button min-h-11 self-start text-green">
              Back
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="min-h-dvh" aria-busy="true" />;
  if (!state.profile) return <Welcome />;
  return (
    <>
      <a href="#main" className="t-button sr-only z-50 rounded-[6px] bg-green px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <TopNav />
      <div id="main" className="mx-auto w-full max-w-6xl md:px-8">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
