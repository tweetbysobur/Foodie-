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

export function Wordmark({ className }: { className?: string }) {
  return <span className={cx("font-[family-name:var(--font-wordmark)] font-black tracking-tight text-green", className)}>Foodie</span>;
}

export function Logo({ size = 36, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image src="/brand/foodie-mark.webp" alt={withWord ? "" : "Foodie"} width={size} height={size} className="shrink-0" priority />
      {withWord && <Wordmark className="text-[24px] leading-none" />}
    </span>
  );
}

export function FoodImage({ photo, sizes, priority, className }: { photo: Photo; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={cx("relative overflow-hidden bg-peach", className)}>
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

/** States: default, hover (colour only), pressed (scale), disabled, loading. */
export function Button({ children, onClick, type = "button", disabled, loading, className, variant = "primary", size = "md", ariaLabel }: BtnProps) {
  const styles = {
    primary: "bg-orange-strong text-white hover:bg-orange-press",
    green: "bg-green text-white hover:bg-green-deep",
    secondary: "bg-surface text-green ring-[1.5px] ring-inset ring-line hover:bg-sage/50",
    ghost: "text-green hover:bg-sage/60",
    danger: "bg-surface text-danger ring-[1.5px] ring-inset ring-line hover:bg-danger-soft",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={cx(
        "t-button inline-flex items-center justify-center gap-2 rounded-full transition-[background-color,transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        size === "lg" ? "min-h-[52px] px-6 text-[15px]" : "min-h-11 px-5",
        styles,
        className,
      )}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** Round add-to-cart button. Shows a tick for a moment after adding. */
export function AddButton({ onClick, label, size = 40 }: { onClick: () => boolean | void; label: string; size?: 36 | 40 }) {
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
      style={{ width: size, height: size }}
      className={cx(
        "grid shrink-0 place-items-center rounded-full text-white transition-[background-color,transform] duration-150 active:scale-90",
        done ? "bg-green" : "bg-orange-strong hover:bg-orange-press",
      )}
    >
      {done ? <Check key="d" className="animate-pop size-5" strokeWidth={2.8} /> : <Plus key="p" className="size-5" strokeWidth={2.6} />}
    </button>
  );
}

export function FavButton({ active, onClick, name, className }: { active: boolean; onClick: () => void; name: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      className={cx("grid size-11 shrink-0 place-items-center rounded-full transition-colors", active ? "text-orange" : "text-muted hover:text-green", className)}
    >
      <Heart key={String(active)} className={cx("size-[22px]", active && "animate-pop")} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function Stepper({ qty, onChange, name, min = 1, size = "md" }: { qty: number; onChange: (q: number) => void; name: string; min?: number; size?: "sm" | "md" }) {
  const b = size === "sm" ? "size-8" : "size-9";
  return (
    <div role="group" aria-label={`Quantity of ${name}`} className="flex shrink-0 items-center gap-1 rounded-full bg-cream p-1">
      <button onClick={() => onChange(qty - 1)} disabled={qty <= min} aria-label={`One less ${name}`} className={cx(b, "grid place-items-center rounded-full bg-surface text-green transition-transform active:scale-90 disabled:opacity-40")}>
        <Minus className="size-4" strokeWidth={2.6} />
      </button>
      <span key={qty} className="animate-bump t-card tabular w-7 text-center" aria-live="polite">
        {qty}
      </span>
      <button onClick={() => onChange(qty + 1)} disabled={qty >= 20} aria-label={`One more ${name}`} className={cx(b, "grid place-items-center rounded-full bg-surface text-green transition-transform active:scale-90 disabled:opacity-40")}>
        <Plus className="size-4" strokeWidth={2.6} />
      </button>
    </div>
  );
}

/** One chip size everywhere: 40px tall, 16px sides, 14px label. */
export function Chip({ active, children, onClick, icon: Icon }: { active: boolean; children: ReactNode; onClick: () => void; icon?: typeof Plus }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold transition-colors duration-200",
        active ? "bg-orange-strong text-white" : "bg-surface text-green shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-sage/50",
      )}
    >
      {Icon && <Icon className={cx("size-4", active ? "text-white" : "text-orange-strong")} strokeWidth={2.2} aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Text blocks ---------- */

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="t-section text-ink">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Empty states use the Foodie bowl, the one illustration only this brand has. */
export function Empty({ title, body, action, compact, plain }: { title: string; body: string; action?: ReactNode; compact?: boolean; plain?: boolean }) {
  return (
    <div className={cx("flex flex-col items-center text-center", !plain && "rounded-[var(--radius-card)] bg-surface", compact ? "gap-1 px-5 py-6" : "gap-1.5 px-6 py-10")}>
      <Image src="/brand/foodie-mark.webp" alt="" width={compact ? 56 : 88} height={compact ? 56 : 88} className="mb-2" />
      <p className="t-card text-ink">{title}</p>
      <p className="t-body max-w-xs text-muted-ink">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-1.5 rounded-[var(--radius-card)] bg-surface px-6 py-9 text-center">
      <p className="t-card text-ink">Something went wrong</p>
      <p className="t-body max-w-xs text-muted-ink">{message}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx("skeleton rounded-[var(--radius-tile)]", className)} />;
}

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      aria-label="Go back"
      className={cx("grid size-11 shrink-0 place-items-center rounded-full bg-surface text-green shadow-soft transition-transform active:scale-95", className)}
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}

export function PageHeader({ title, subtitle, right, back = true }: { title: string; subtitle?: ReactNode; right?: ReactNode; back?: boolean }) {
  return (
    <header className="flex items-center gap-3">
      {back && <BackButton />}
      <div className="min-w-0 flex-1">
        <h1 className={cx("truncate text-ink", back ? "t-section" : "t-page")}>{title}</h1>
        {subtitle && <p className="t-support truncate text-muted-ink">{subtitle}</p>}
      </div>
      {right}
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
    <div className="animate-fade fixed inset-0 z-40 flex items-end justify-center bg-ink/45 md:items-center md:p-6" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-rise flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-surface outline-none md:rounded-[28px]"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line md:hidden" />
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-3 md:pt-5">
          <h2 className="t-section text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-cream text-green transition-colors hover:bg-sage">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-line px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">{footer}</div>}
        {!footer && <div className="h-[env(safe-area-inset-bottom)]" />}
      </div>
    </div>
  );
}

/* ---------- Forms ---------- */

/** Input states: default, focused (green border and sage ring), filled, error (aria-invalid), disabled. */
export const inputClass =
  "t-body min-h-12 w-full rounded-[14px] border-[1.5px] border-line bg-surface px-3.5 text-[16px] text-ink placeholder:text-muted outline-none transition-[border-color,box-shadow] focus:border-green focus:ring-[3px] focus:ring-sage focus-visible:outline-none aria-[invalid=true]:border-danger aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-danger-soft disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted";

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
