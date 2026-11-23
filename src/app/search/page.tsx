"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Search as SearchIcon, SlidersHorizontal, Store, X } from "lucide-react";
import type { CategoryId, MenuItem } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { FoodRow, FoodRowSkeleton } from "@/components/food";
import { Button, Chip, Empty, ErrorState, PageHeader, Sheet, cx } from "@/components/ui";

type Filters = { price: "any" | "under3" | "3to7" | "over7"; maxMinutes: 0 | 30 | 45; minRating: 0 | 4 | 4.5; availableOnly: boolean };
const NO_FILTERS: Filters = { price: "any", maxMinutes: 0, minRating: 0, availableOnly: false };
type Sort = "relevance" | "price-asc" | "price-desc" | "rating" | "fastest";
const SORTS: [Sort, string][] = [
  ["relevance", "Relevance"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Top rated"],
  ["fastest", "Fastest delivery"],
];
/** Tested: each of these returns results from the current menu. */
const TRY = ["Jollof", "Suya", "Amala", "Egusi", "Shawarma", "Zobo"];

export default function SearchPage() {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<Sort>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  const data = catalog.state.status === "ready" ? catalog.state.data : null;
  const term = q.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!data || term.length < 2) return [];
    const dishes = data.menu.filter((m) => m.name.toLowerCase().includes(term)).map((m) => ({ kind: "dish" as const, label: m.name }));
    const vendors = data.vendors.filter((v) => v.name.toLowerCase().includes(term)).map((v) => ({ kind: "vendor" as const, label: v.name, id: v.id }));
    return [...vendors, ...dishes].slice(0, 6);
  }, [data, term]);

  const results = useMemo(() => {
    if (!data) return [];
    const score = (m: MenuItem) => {
      const v = catalog.vendors.get(m.vendorId)!;
      const cat = data.categories.find((c) => c.id === m.category)!.label.toLowerCase();
      if (!term) return 1;
      if (m.name.toLowerCase().startsWith(term)) return 3;
      if (m.name.toLowerCase().includes(term)) return 2;
      if (v.name.toLowerCase().includes(term) || cat.includes(term) || m.description.toLowerCase().includes(term)) return 1;
      return 0;
    };
    const list = data.menu
      .map((m) => ({ m, s: score(m), v: catalog.vendors.get(m.vendorId)! }))
      .filter(({ m, s, v }) => {
        if (s === 0) return false;
        if (cat !== "all" && m.category !== cat) return false;
        if (vendorId && m.vendorId !== vendorId) return false;
        if (filters.price === "under3" && m.price >= 3000) return false;
        if (filters.price === "3to7" && (m.price < 3000 || m.price > 7000)) return false;
        if (filters.price === "over7" && m.price <= 7000) return false;
        if (filters.maxMinutes && v.deliveryMinutes[1] > filters.maxMinutes) return false;
        if (filters.minRating && m.rating < filters.minRating) return false;
        if (filters.availableOnly && !m.available) return false;
        return true;
      });
    const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      relevance: (a, b) => b.s - a.s || b.m.rating - a.m.rating,
      "price-asc": (a, b) => a.m.price - b.m.price,
      "price-desc": (a, b) => b.m.price - a.m.price,
      rating: (a, b) => b.m.rating - a.m.rating,
      fastest: (a, b) => a.v.deliveryMinutes[1] - b.v.deliveryMinutes[1],
    };
    return list.sort(by[sort]).map((x) => x.m);
  }, [data, term, cat, vendorId, filters, sort, catalog.vendors]);

  const activeFilters =
    (filters.price !== "any" ? 1 : 0) + (filters.maxMinutes ? 1 : 0) + (filters.minRating ? 1 : 0) + (filters.availableOnly ? 1 : 0);
  const browsing = !term && cat === "all" && !vendorId && activeFilters === 0;
  const commit = (t: string) => {
    setQ(t);
    dispatch({ type: "addSearch", term: t });
    setFocused(false);
    input.current?.blur();
  };

  return (
    <main className="pb-nav flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:px-0 md:pt-8">
      <PageHeader title="Search" back={false} />

      <div className="relative">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) commit(q.trim());
          }}
          className="flex items-center gap-2.5 rounded-[var(--radius-card)] bg-surface pl-4 pr-1.5 shadow-soft focus-within:ring-2 focus-within:ring-green"
        >
          <SearchIcon className="size-5 shrink-0 text-muted" />
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search meals or vendors"
            aria-label="Search meals or vendors"
            enterKeyHint="search"
            className="min-h-14 min-w-0 flex-1 bg-transparent text-ink outline-none focus-visible:outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid size-10 place-items-center rounded-full text-muted-ink">
              <X className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label={`Filters${activeFilters ? `, ${activeFilters} on` : ""}`}
            className={cx("relative grid size-11 place-items-center rounded-[14px]", activeFilters ? "bg-green text-white" : "bg-sage text-green")}
          >
            <SlidersHorizontal className="size-5" />
            {activeFilters > 0 && <span className="tabular absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-orange-strong text-[11px] font-bold text-white">{activeFilters}</span>}
          </button>
        </form>

        {focused && suggestions.length > 0 && (
          <ul role="listbox" aria-label="Suggestions" className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[var(--radius-tile)] bg-surface py-1 shadow-float">
            {suggestions.map((s) => (
              <li key={s.kind + s.label}>
                <button
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (s.kind === "vendor") {
                      setVendorId(s.id);
                      setQ("");
                      dispatch({ type: "addSearch", term: s.label });
                      setFocused(false);
                    } else commit(s.label);
                  }}
                  className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-[15px] text-ink hover:bg-cream"
                >
                  {s.kind === "vendor" ? <Store className="size-4 text-green" /> : <SearchIcon className="size-4 text-muted" />}
                  {s.label}
                  {s.kind === "vendor" && <span className="ml-auto text-[12px] text-muted-ink">Vendor</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Category">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {data?.categories.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>
        ))}
      </div>

      {browsing && (
        <div className="flex flex-col gap-5">
          {state.recentSearches.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-ink">Recent searches</h2>
                <button onClick={() => dispatch({ type: "clearSearches" })} className="min-h-11 text-sm font-semibold text-green">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.recentSearches.map((t) => (
                  <button key={t} onClick={() => setQ(t)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-ink">
                    <Clock className="size-4 text-muted" /> {t}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[18px] font-bold text-ink">Try searching</h2>
            <div className="flex flex-wrap gap-2">
              {TRY.map((t) => (
                <button key={t} onClick={() => commit(t)} className="min-h-10 rounded-full bg-sage px-4 text-sm font-semibold text-green">{t}</button>
              ))}
            </div>
          </section>
        </div>
      )}

      <section className="flex flex-col gap-3" aria-busy={catalog.state.status === "loading"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-bold text-ink" aria-live="polite">
            {browsing ? "All dishes" : `${results.length} ${results.length === 1 ? "dish" : "dishes"}`}
          </h2>
          <label className="flex items-center gap-2 text-[13px] font-medium text-muted-ink">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-10 rounded-full border-[1.5px] border-line bg-surface px-3 text-[14px] font-semibold text-green">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        {vendorId && (
          <button onClick={() => setVendorId(null)} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-green px-4 text-sm font-semibold text-white">
            <Store className="size-4" /> {catalog.vendors.get(vendorId)?.name} <X className="size-4" />
          </button>
        )}
        {catalog.state.status === "error" ? (
          <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
        ) : catalog.state.status === "loading" ? (
          <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2].map((i) => <FoodRowSkeleton key={i} />)}</div>
        ) : results.length === 0 ? (
          <Empty
            title="No dishes match"
            body={term ? `Nothing found for "${q.trim()}". Check the spelling or try a dish like jollof or suya.` : "No dishes match these filters. Remove a filter to see more."}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setCat("all");
                  setVendorId(null);
                  setFilters(NO_FILTERS);
                }}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">{results.map((m) => <FoodRow key={m.id} item={m} />)}</div>
        )}
      </section>

      {filtersOpen && <FilterSheet value={filters} onApply={(f) => { setFilters(f); setFiltersOpen(false); }} onClose={() => setFiltersOpen(false)} />}
    </main>
  );
}

function FilterSheet({ value, onApply, onClose }: { value: Filters; onApply: (f: Filters) => void; onClose: () => void }) {
  const [f, setF] = useState(value);
  const group = <K extends keyof Filters>(title: string, key: K, options: [Filters[K], string][]) => (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-[15px] font-bold text-ink">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <Chip key={String(v)} active={f[key] === v} onClick={() => setF({ ...f, [key]: v })}>{l}</Chip>
        ))}
      </div>
    </fieldset>
  );
  return (
    <Sheet title="Filters" onClose={onClose}>
      <div className="flex flex-col gap-6 [&_button[aria-pressed=false]]:bg-cream">
        {group("Price", "price", [["any", "Any price"], ["under3", "Under ₦3,000"], ["3to7", "₦3,000 - ₦7,000"], ["over7", "Over ₦7,000"]])}
        {group("Delivery time", "maxMinutes", [[0, "Any time"], [30, "Under 30 min"], [45, "Under 45 min"]])}
        {group("Rating", "minRating", [[0, "Any rating"], [4, "4.0 and up"], [4.5, "4.5 and up"]])}
        {group("Availability", "availableOnly", [[false, "Show all"], [true, "Available now"]])}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setF(NO_FILTERS)}>Reset</Button>
          <Button className="flex-1" onClick={() => onApply(f)}>Show results</Button>
        </div>
      </div>
    </Sheet>
  );
}
