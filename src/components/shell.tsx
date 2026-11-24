"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Heart, House, MapPin, Pencil, Plus, ReceiptText, Search, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { naira } from "@/lib/format";
import { cartTotals } from "@/lib/pricing";
import type { Address } from "@/lib/types";
import { newId, useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { Button, Field, Logo, Sheet, TextInput, Wordmark, cx } from "./ui";

const NAV = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/orders", label: "Orders", Icon: ReceiptText },
  { href: "/favourites", label: "Favourites", Icon: Heart },
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

export function BottomNav() {
  const path = usePathname();
  const totals = useCartSummary();
  if (FULL_SCREEN.some((r) => r.test(path))) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2.5 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden">
      {totals.count > 0 && (
        <Link
          href="/cart"
          className="pointer-events-auto flex min-h-[50px] w-full max-w-md items-center gap-3 rounded-full bg-green px-5 text-white shadow-float transition-transform active:scale-[0.98]"
        >
          <ShoppingBag key={totals.count} className="animate-bump size-[22px] shrink-0 text-orange" aria-hidden />
          <span className="t-button flex-1 text-[15px]">
            View cart · {totals.count} {totals.count === 1 ? "item" : "items"}
          </span>
          <span className="t-price text-[16px]">{naira(totals.subtotal)}</span>
        </Link>
      )}
      <nav aria-label="Main" className="pointer-events-auto flex w-full max-w-md justify-between rounded-[26px] bg-surface px-2 py-1 shadow-float">
        {NAV.map(({ href, label, Icon }) => {
          const on = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cx("t-nav relative flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 transition-colors", on ? "font-semibold text-orange-strong" : "text-muted-ink hover:text-green")}
            >
              <span aria-hidden className={cx("absolute top-0.5 size-1 rounded-full", on ? "bg-orange" : "bg-transparent")} />
              <Icon className={cx("size-[22px]", on ? "text-orange" : "text-muted")} fill={on && label !== "Search" ? "currentColor" : "none"} strokeWidth={on ? 2 : 1.7} aria-hidden />
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
      <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-4 px-8 lg:gap-8">
        <Link href="/" aria-label="Foodie home" className="rounded-xl">
          <Logo size={40} />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const on = isActive(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cx("inline-flex h-10 items-center gap-2 rounded-full px-3 text-[14px] font-semibold transition-colors lg:px-4", on ? "bg-sage text-green" : "text-muted-ink hover:bg-surface hover:text-green")}
              >
                <Icon className={cx("hidden size-[18px] lg:block", on && "text-green")} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link href="/cart" className="t-button ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-green px-5 text-white transition-colors hover:bg-green-deep">
          <ShoppingBag className="size-[18px] text-orange" aria-hidden />
          Cart
          {totals.count > 0 && (
            <span key={totals.count} className="animate-bump tabular rounded-full bg-orange-strong px-2 py-0.5 text-[12px]">
              {totals.count}
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
          <button
            type="button"
            role="radio"
            aria-checked={label === l}
            key={l}
            onClick={() => setLabel(l)}
            className={cx("h-10 rounded-full px-4 text-[14px] font-semibold transition-colors", label === l ? "bg-green text-white" : "bg-cream text-green hover:bg-sage")}
          >
            {l}
          </button>
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
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Saved addresses">
            {state.addresses.map((a) => {
              const on = a.id === state.selectedAddressId;
              return (
                <li key={a.id} className={cx("flex items-center gap-1 rounded-[var(--radius-tile)] p-1 pr-1.5 transition-colors", on ? "bg-sage" : "bg-cream")}>
                  <button
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      dispatch({ type: "selectAddress", id: a.id });
                      onClose();
                    }}
                    className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-[12px] px-3 text-left"
                  >
                    <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border-2", on ? "border-green bg-green text-white" : "border-muted")}>
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="t-card block text-ink">{a.label}</span>
                      <span className="t-support block truncate text-muted-ink">{formatAddress(a)}</span>
                    </span>
                  </button>
                  <button onClick={() => setEditing(a)} aria-label={`Edit ${a.label} address`} className="grid size-10 place-items-center rounded-full text-green hover:bg-surface">
                    <Pencil className="size-4" />
                  </button>
                  {state.addresses.length > 1 && (
                    <button
                      onClick={() => {
                        dispatch({ type: "removeAddress", id: a.id });
                        toast("Address removed");
                      }}
                      aria-label={`Remove ${a.label} address`}
                      className="grid size-10 place-items-center rounded-full text-danger hover:bg-surface"
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

/** Areas we know kitchens deliver to. Anything else can be typed. */
const AREAS = ["Alabata", "Kuto", "Ibara", "Oke-Ilewo", "Lafenwa", "Panseke"];

/**
 * First visit: green page, brand on top, one white block with the questions.
 * Step 1 asks a first name, step 2 where to deliver. Phone is asked at checkout.
 * Text in the white block uses orange-strong (#CF4510, 4.65:1 on white).
 */
function Splash({ onDone }: { onDone: () => void }) {
  // Moves on by itself after a short beat; a tap skips it.
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <button
      onClick={onDone}
      aria-label="Welcome to Foodie. Tap to continue"
      className="flex min-h-dvh w-full cursor-default flex-col items-center justify-center bg-green px-8 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-center"
    >
      <Image src="/brand/foodie-mark-ongreen.webp" alt="" width={148} height={148} priority className="animate-pop" />
      <span className="animate-page mt-7 text-[44px] font-extrabold leading-none tracking-[-0.025em] text-white">Welcome</span>
      <span className="animate-page mt-3 text-[19px] font-medium leading-snug text-peach">Foodie gat you covered</span>
    </button>
  );
}

/** One row of the grouped form: label inside the row, typed text in orange. */
function GroupRow({ id, label, value, onChange, error, ...rest }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.ComponentProps<"input">, "onChange" | "value">) {
  return (
    <label htmlFor={id} className="flex flex-col gap-0.5 px-4 py-3 transition-colors focus-within:bg-cream/60">
      <span className={cx("text-[12px] font-semibold", error ? "text-danger" : "text-muted-ink")}>{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="w-full bg-transparent text-[17px] font-semibold text-orange-strong caret-orange-strong outline-none placeholder:font-normal placeholder:text-muted focus-visible:outline-none"
        {...rest}
      />
    </label>
  );
}

/**
 * Sign-up. Green page, a white panel rising from the bottom, one grouped box
 * for name, area and street. Phone is asked at checkout.
 */
function Welcome() {
  const { dispatch } = useStore();
  const [splash, setSplash] = useState(true);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [line, setLine] = useState("");
  const [tried, setTried] = useState(false);
  const endSplash = useCallback(() => setSplash(false), []);
  const errors = {
    name: !name.trim() ? "Tell us your first name." : "",
    area: !area.trim() ? "Tell us your area." : "",
    line: line.trim().length < 3 ? "Add your house number and street." : "",
  };
  const missing = [errors.name && "first name", errors.area && "area", errors.line && "street"].filter(Boolean) as string[];
  const firstError = missing.length === 0 ? "" : missing.length === 1 ? Object.values(errors).find(Boolean)! : `Add your ${missing.slice(0, -1).join(", ")} and ${missing.at(-1)}.`;
  if (splash) return <Splash onDone={endSplash} />;

  return (
    <div className="flex min-h-dvh flex-col bg-green">
      <header className="animate-page mx-auto flex w-full max-w-md flex-col items-center px-6 pb-9 pt-[calc(env(safe-area-inset-top)+36px)] text-center">
        <Image src="/brand/foodie-mark-ongreen.webp" alt="" width={84} height={84} priority />
        <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white">Let&rsquo;s get you set up</h1>
        <p className="mt-1.5 text-[16px] text-peach">Tell us who you are and where to deliver.</p>
      </header>

      <main className="animate-rise mx-auto flex w-full max-w-md flex-1 flex-col rounded-t-[36px] bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-7">
        <form
          noValidate
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (firstError) return;
            dispatch({
              type: "signIn",
              profile: { name: name.trim(), phone: "", photo: null, preferredPayment: "pay_on_delivery" },
              address: { id: newId(), label: "Home", line: line.trim(), area: area.trim(), city: "Abeokuta" },
            });
          }}
        >
          <div className={cx("divide-y divide-line overflow-hidden rounded-[20px] ring-[1.5px] transition-colors", tried && firstError ? "ring-danger/60" : "ring-line focus-within:ring-orange-strong/50")}>
            <GroupRow id="w-name" label="First name" value={name} onChange={setName} error={tried ? errors.name : ""} autoComplete="given-name" placeholder="Your first name" />
            <GroupRow id="w-area" label="Area in Abeokuta" value={area} onChange={setArea} error={tried ? errors.area : ""} autoComplete="address-level3" placeholder="Alabata, Kuto, Ibara..." />
            <GroupRow id="w-line" label="Street and house number" value={line} onChange={setLine} error={tried ? errors.line : ""} autoComplete="address-line1" placeholder="12 Olorunsogo Street" />
          </div>

          {tried && firstError ? (
            <p role="alert" className="mt-2.5 px-1 text-[13px] text-danger">
              {firstError}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick pick an area">
            {AREAS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setArea(a)}
                aria-pressed={area === a}
                className={cx("h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors", area === a ? "bg-green text-white" : "bg-cream text-ink hover:bg-peach")}
              >
                {a}
              </button>
            ))}
          </div>

          <Button type="submit" size="lg" className="mt-auto w-full">
            Start ordering
          </Button>
        </form>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="min-h-dvh" aria-busy="true" />;
  if (!state.profile) return <Welcome />;
  return (
    <>
      <a href="#main" className="t-button sr-only z-50 rounded-full bg-green px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
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
