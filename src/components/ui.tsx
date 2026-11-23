"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Heart, Minus, Plus, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MenuItem, Photo } from "@/lib/types";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function FoodImage({ photo, sizes, priority, className }: { photo: Photo; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={cx("relative overflow-hidden bg-peach", className)}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

export function Logo({ size = 36, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image src="/brand/foodie-mark.webp" alt={withWord ? "" : "Foodie"} width={size} height={size} className="shrink-0" priority />
      {withWord && <span className="text-[22px] font-extrabold tracking-tight text-green">Foodie</span>}
    </span>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "green" | "ghost" | "danger";
  size?: "md" | "lg";
  ariaLabel?: string;
};

export function Button({ children, onClick, type = "button", disabled, className, variant = "primary", size = "md", ariaLabel }: BtnProps) {
  const styles = {
    primary: "bg-orange-strong text-white hover:bg-[#b93d0e]",
    green: "bg-green text-white hover:bg-[#1a4d3a]",
    secondary: "bg-surface text-green ring-1 ring-inset ring-line hover:bg-sage/60",
    ghost: "text-green hover:bg-sage/60",
    danger: "bg-surface text-danger ring-1 ring-inset ring-line hover:bg-peach/60",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] disabled:opacity-45 disabled:active:scale-100",
        size === "lg" ? "min-h-[52px] px-6 text-base" : "min-h-11 px-5 text-[15px]",
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-strong text-white transition-transform duration-150 active:scale-90"
    >
      <Plus className="size-5" strokeWidth={2.6} />
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
      <Heart className="size-[22px]" fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function Stepper({ qty, onChange, name, min = 1 }: { qty: number; onChange: (q: number) => void; name: string; min?: number }) {
  return (
    <div role="group" aria-label={`Quantity of ${name}`} className="flex shrink-0 items-center gap-1 rounded-full bg-cream p-1">
      <button
        onClick={() => onChange(qty - 1)}
        disabled={qty <= min}
        aria-label={`One less ${name}`}
        className="grid size-9 place-items-center rounded-full bg-surface text-green disabled:opacity-40"
      >
        <Minus className="size-4" strokeWidth={2.6} />
      </button>
      <span className="tabular w-7 text-center font-bold" aria-live="polite">
        {qty}
      </span>
      <button onClick={() => onChange(qty + 1)} disabled={qty >= 20} aria-label={`One more ${name}`} className="grid size-9 place-items-center rounded-full bg-surface text-green disabled:opacity-40">
        <Plus className="size-4" strokeWidth={2.6} />
      </button>
    </div>
  );
}

export function Chip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors",
        active ? "bg-orange-strong text-white" : "bg-surface text-green hover:bg-sage/60",
      )}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[20px] font-bold tracking-tight text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5 rounded-[var(--radius-card)] bg-surface px-5 py-6">
      <Image src="/brand/foodie-mark.webp" alt="" width={52} height={52} className="mb-2 opacity-90" />
      <p className="text-[17px] font-bold text-ink">{title}</p>
      <p className="text-[15px] leading-relaxed text-muted-ink">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-1.5 rounded-[var(--radius-card)] bg-surface px-5 py-6">
      <p className="text-[17px] font-bold text-ink">Something went wrong</p>
      <p className="text-[15px] leading-relaxed text-muted-ink">{message}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx("skeleton rounded-[var(--radius-tile)]", className)} />;
}

export function PageHeader({ title, right, back = true }: { title: string; right?: ReactNode; back?: boolean }) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3">
      {back && (
        <button
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          aria-label="Go back"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-green shadow-soft"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}
      <h1 className={cx("min-w-0 flex-1 truncate font-bold tracking-tight text-ink", back ? "text-[22px]" : "text-[30px]")}>{title}</h1>
      {right}
    </header>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="animate-fade fixed inset-0 z-40 flex items-end justify-center bg-ink/45 md:items-center" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-rise max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-surface px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5 outline-none md:rounded-[28px]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-cream text-green">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="text-[13px] text-muted-ink">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-[14px] border-[1.5px] border-line bg-surface px-3.5 text-ink placeholder:text-muted outline-none focus:border-green focus:ring-[3px] focus:ring-sage focus-visible:outline-none";

export function LinkRow({ href, children, right }: { href: string; children: ReactNode; right?: ReactNode }) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 text-[16px] text-ink">
      {children}
      <span className="ml-auto flex items-center gap-2 text-muted-ink">{right}</span>
    </Link>
  );
}

export const defaultOptions = (item: MenuItem) => item.options.filter((g) => g.type === "single").map((g) => g.choices[0].id);
