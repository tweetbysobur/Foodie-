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

function Welcome() {
  const { dispatch } = useStore();
  const [splash, setSplash] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [otherArea, setOtherArea] = useState("");
  const [line, setLine] = useState("");
  const [tried, setTried] = useState(false);
  const chosenArea = area === "Other" ? otherArea.trim() : area;
  const nameError = !name.trim() ? "Tell us your first name." : "";
  const areaError = !chosenArea ? "Pick your area, or choose Other and type it." : "";
  const lineError = line.trim().length < 3 ? "Enter your house number and street." : "";
  const label = "text-[14px] font-semibold text-orange-strong";
  const endSplash = useCallback(() => setSplash(false), []);
  if (splash) return <Splash onDone={endSplash} />;

  return (
    <div className="min-h-dvh bg-green">
      <main className="animate-page mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[calc(env(safe-area-inset-top)+44px)]">
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/foodie-mark-ongreen.webp" alt="" width={104} height={104} priority />
          <span className="mt-2 text-[40px] font-extrabold leading-none tracking-[-0.02em] text-white">Foodie</span>
          <p className="mt-2 max-w-[260px] text-[15px] leading-snug text-white/85">Nigerian food from kitchens near you, delivered.</p>
        </div>

        <section className="mt-8 rounded-[24px] bg-surface p-5" aria-labelledby="welcome-h">
          <div role="progressbar" aria-label="Sign up progress" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step} className="mb-5 flex gap-1.5">
            {[1, 2].map((n) => (
              <span key={n} className={cx("h-1.5 flex-1 rounded-full transition-colors duration-300", n <= step ? "bg-orange-strong" : "bg-peach")} />
            ))}
          </div>

          {step === 1 ? (
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (nameError) return;
                setTried(false);
                setStep(2);
              }}
            >
              <h1 id="welcome-h" className="text-[20px] font-bold text-orange-strong">
                What should we call you?
              </h1>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="w-name" className={label}>
                  First name
                </label>
                <TextInput id="w-name" error={tried ? nameError : ""} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
                {tried && nameError && (
                  <p id="w-name-error" role="alert" className="t-support text-danger">
                    {nameError}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="mt-1">
                Continue
              </Button>
            </form>
          ) : (
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (areaError || lineError) return;
                dispatch({
                  type: "signIn",
                  profile: { name: name.trim(), phone: "", photo: null, preferredPayment: "pay_on_delivery" },
                  address: { id: newId(), label: "Home", line: line.trim(), area: chosenArea, city: "Abeokuta" },
                });
              }}
            >
              <h1 id="welcome-h" className="text-[20px] font-bold text-orange-strong">
                Where should we deliver, {name.trim().split(" ")[0]}?
              </h1>
              <fieldset className="flex flex-col gap-2">
                <legend className={cx(label, "mb-2")}>Your area in Abeokuta</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Area">
                  {[...AREAS, "Other"].map((a) => {
                    const on = area === a;
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={on}
                        key={a}
                        onClick={() => setArea(a)}
                        className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", on ? "bg-green text-white" : "bg-cream text-ink hover:bg-peach")}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
                {area === "Other" && <TextInput id="w-area" aria-label="Type your area" value={otherArea} onChange={(e) => setOtherArea(e.target.value)} placeholder="Type your area" autoFocus />}
                {tried && areaError && (
                  <p role="alert" className="t-support text-danger">
                    {areaError}
                  </p>
                )}
              </fieldset>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="w-line" className={label}>
                  Street and house number
                </label>
                <TextInput id="w-line" error={tried ? lineError : ""} value={line} onChange={(e) => setLine(e.target.value)} autoComplete="address-line1" placeholder="12 Olorunsogo Street" />
                {tried && lineError && (
                  <p id="w-line-error" role="alert" className="t-support text-danger">
                    {lineError}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="mt-1">
                Start ordering
              </Button>
              <button
                type="button"
                onClick={() => {
                  setTried(false);
                  setStep(1);
                }}
                className="min-h-11 text-[14px] font-semibold text-orange-strong"
              >
                Back
              </button>
            </form>
          )}
        </section>

        <p className="mt-auto pt-6 text-center text-[13px] text-white/75">No password needed. Your details stay on this phone.</p>
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
