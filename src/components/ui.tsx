"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { ArrowLeft, Check, Heart, LoaderCircle, Minus, Plus, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MenuItem, Photo } from "@/lib/types";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------- Brand ---------- */

/** The brand is the word. Bricolage, heavy, tight, forest green. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cx("font-[family-name:var(--font-wordmark)] font-extrabold tracking-[-0.035em] text-green", className)}>Foodie</span>;
}

export function FoodImage({ photo, sizes, priority, className }: { photo: Photo; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={cx("relative overflow-hidden bg-board", className)}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

/* ---------- Buttons ---------- */

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "green" | "ghost" | "danger";
  size?: "md" | "lg";
  ariaLabel?: string;
};

/** Flat, 6px corners. States: default, hover (colour), pressed (darker + 1px nudge), disabled, loading. */
export function Button({ children, onClick, type = "button", disabled, loading, className, variant = "primary", size = "md", ariaLabel }: BtnProps) {
  const styles = {
    primary: "bg-orange-strong text-white hover:bg-orange-press",
    green: "bg-green text-white hover:bg-green-deep",
    secondary: "bg-transparent text-green ring-[1.5px] ring-inset ring-ink/70 hover:bg-board/60",
    ghost: "text-green hover:bg-board/60",
    danger: "bg-transparent text-danger ring-[1.5px] ring-inset ring-danger/60 hover:bg-danger-soft",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={cx(
        "t-button inline-flex items-center justify-center gap-2 rounded-[6px] transition-[background-color,transform] duration-100 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0",
        size === "lg" ? "min-h-[52px] px-6 text-[16px]" : "min-h-11 px-4",
        styles,
        className,
      )}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** Text-style add for menu rows. Turns into "Added" for a moment. */
export function AddText({ onClick, label }: { onClick: () => boolean | void; label: string }) {
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <button
      onClick={() => {
        if (onClick() === false) return;
        setDone(true);
        clearTimeout(t.current);
        t.current = setTimeout(() => setDone(false), 1100);
      }}
      aria-label={label}
      className={cx(
        "inline-flex h-9 shrink-0 items-center gap-1 rounded-[6px] px-3 text-[14px] font-bold transition-colors",
        done ? "bg-green text-white" : "bg-orange-strong text-white hover:bg-orange-press",
      )}
    >
      {done ? <Check key="d" className="animate-pop size-4" strokeWidth={3} aria-hidden /> : <Plus key="p" className="size-4" strokeWidth={3} aria-hidden />}
      {done ? "Added" : "Add"}
    </button>
  );
}

export function FavButton({ active, onClick, name, className }: { active: boolean; onClick: () => void; name: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from saved` : `Save ${name}`}
      className={cx("grid size-11 shrink-0 place-items-center rounded-[6px] transition-colors", active ? "text-burnt" : "text-muted-ink hover:text-green", className)}
    >
      <Heart key={String(active)} className={cx("size-[22px]", active && "animate-pop")} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function Stepper({ qty, onChange, name, min = 1 }: { qty: number; onChange: (q: number) => void; name: string; min?: number }) {
  const b = "grid size-9 place-items-center rounded-[6px] text-green transition-colors hover:bg-board disabled:opacity-35";
  return (
    <div role="group" aria-label={`Quantity of ${name}`} className="flex shrink-0 items-center rounded-[6px] ring-[1.5px] ring-inset ring-ink/70">
      <button onClick={() => onChange(qty - 1)} disabled={qty <= min} aria-label={`One less ${name}`} className={b}>
        <Minus className="size-4" strokeWidth={2.6} />
      </button>
      <span key={qty} className="animate-bump tabular w-7 text-center font-[family-name:var(--font-display)] text-[17px] font-bold" aria-live="polite">
        {qty}
      </span>
      <button onClick={() => onChange(qty + 1)} disabled={qty >= 20} aria-label={`One more ${name}`} className={b}>
        <Plus className="size-4" strokeWidth={2.6} />
      </button>
    </div>
  );
}

/** Text tabs with a burnt underline. Used for categories and filters. */
export function Tab({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "relative shrink-0 whitespace-nowrap pb-2 pt-1 font-[family-name:var(--font-display)] text-[17px] font-bold tracking-[-0.01em] transition-colors",
        active ? "text-ink" : "text-muted-ink hover:text-ink",
      )}
    >
      {children}
      <span aria-hidden className={cx("absolute inset-x-0 bottom-0 h-[3px] transition-colors", active ? "bg-burnt" : "bg-transparent")} />
    </button>
  );
}

/** Square option for sheets and forms: outlined, fills green when on. */
export function Choice({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "h-10 shrink-0 rounded-[6px] px-3.5 text-[14px] font-semibold transition-colors",
        active ? "bg-green text-white" : "text-ink ring-[1.5px] ring-inset ring-line hover:ring-ink/60",
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Text blocks ---------- */

/** A board heading: big word, rule underneath. */
export function BoardHeading({ children, action, id, as: As = "h2" }: { children: ReactNode; action?: ReactNode; id?: string; as?: "h1" | "h2" }) {
  return (
    <div className="flex items-end justify-between gap-3 border-b-2 border-ink pb-2">
      <As id={id} className="t-section text-ink">
        {children}
      </As>
      {action}
    </div>
  );
}

/** Empty states are typographic: a big line, a plain sentence, one action. */
export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 py-8">
      <p className="t-page max-w-xs text-ink">{title}</p>
      <p className="t-body max-w-sm text-[15px] text-muted-ink">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2 py-8">
      <p className="t-page text-ink">Something went wrong.</p>
      <p className="t-body max-w-sm text-[15px] text-muted-ink">{message}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx("skeleton rounded-[6px]", className)} />;
}

export function BackButton({ className, onPhoto }: { className?: string; onPhoto?: boolean }) {
  const router = useRouter();
  return (
    <button
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      aria-label="Go back"
      className={cx("grid size-11 shrink-0 place-items-center rounded-[6px] text-green transition-colors", onPhoto ? "bg-cream" : "-ml-2.5 hover:bg-board/60", className)}
    >
      <ArrowLeft className="size-[22px]" strokeWidth={2.2} />
    </button>
  );
}

/** Page title block. Top-level pages get the big board title; inner pages get a back arrow. */
export function PageHeader({ title, subtitle, right, back = true }: { title: string; subtitle?: ReactNode; right?: ReactNode; back?: boolean }) {
  return (
    <header className="flex flex-col gap-1">
      {back && (
        <div className="flex items-center justify-between">
          <BackButton />
          {right}
        </div>
      )}
      <div className="flex items-end justify-between gap-3">
        <h1 className={cx("min-w-0 text-ink", back ? "t-page" : "t-display")}>{title}</h1>
        {!back && right}
      </div>
      {subtitle && <p className="t-body text-[15px] text-muted-ink">{subtitle}</p>}
    </header>
  );
}

/* ---------- Sheet / dialog ---------- */

export function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="animate-fade fixed inset-0 z-40 flex items-end justify-center bg-ink/50 md:items-center md:p-6" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-rise flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-[12px] bg-cream outline-none md:rounded-[12px]"
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-5 pb-3 pt-5">
          <h2 className="t-section text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 grid size-10 place-items-center rounded-[6px] text-green hover:bg-board/60">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-line px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">{footer}</div>}
        {!footer && <div className="h-[env(safe-area-inset-bottom)]" />}
      </div>
    </div>
  );
}

/* ---------- Forms ---------- */

/** Input states: default (hairline), focused (ink border, board ring), filled, error (aria-invalid), disabled. */
export const inputClass =
  "t-body min-h-12 w-full rounded-[6px] border-[1.5px] border-line bg-surface px-3.5 text-[16px] text-ink placeholder:text-muted outline-none transition-[border-color,box-shadow] focus:border-ink focus:ring-[3px] focus:ring-board focus-visible:outline-none aria-[invalid=true]:border-danger aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-danger-soft disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted";

export function Field({ label, children, hint, error, id }: { label: string; children: ReactNode; hint?: string; error?: string; id?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-field text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={id ? `${id}-error` : undefined} role="alert" className="t-support text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="t-support text-muted-ink">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ id, error, ...rest }: ComponentProps<"input"> & { id: string; error?: string }) {
  return <input id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className={inputClass} {...rest} />;
}

export const defaultOptions = (item: MenuItem) => item.options.filter((g) => g.type === "single").map((g) => g.choices[0].id);
