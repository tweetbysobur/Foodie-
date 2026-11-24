"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Clock, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import type { CategoryId, MenuItem, Vendor } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { DishRow, DishRowSkeleton } from "@/components/food";
import { BoardHeading, Button, Choice, Empty, ErrorState, PageHeader, Sheet, cx } from "@/components/ui";

type Sort = "relevance" | "price-asc" | "price-desc" | "rating" | "fastest";
type Filters = { cat: CategoryId | "all"; price: "any" | "under3" | "3to7" | "over7"; maxMinutes: 0 | 30 | 45; minRating: 0 | 4 | 4.5; availableOnly: boolean; sort: Sort };
const NO_FILTERS: Filters = { cat: "all", price: "any", maxMinutes: 0, minRating: 0, availableOnly: false, sort: "relevance" };
const SORTS: [Sort, string][] = [
  ["relevance", "Best match"],
  ["rating", "Top rated"],
  ["fastest", "Fastest"],
  ["price-asc", "Cheapest"],
  ["price-desc", "Most expensive"],
];
const PRICES: [Filters["price"], string][] = [
  ["any", "Any price"],
  ["under3", "Under ₦3,000"],
  ["3to7", "₦3,000 to ₦7,000"],
  ["over7", "Over ₦7,000"],
];

function applyFilters(menu: MenuItem[], vendors: Map<string, Vendor>, catLabel: (id: CategoryId) => string, term: string, vendorId: string | null, f: Filters) {
  const score = (m: MenuItem) => {
    if (!term) return 1;
    const n = m.name.toLowerCase();
    if (n.startsWith(term)) return 3;
    if (n.includes(term)) return 2;
    const v = vendors.get(m.vendorId)!;
    if (v.name.toLowerCase().includes(term) || catLabel(m.category).toLowerCase().includes(term) || m.description.toLowerCase().includes(term)) return 1;
    return 0;
  };
  const list = menu
    .map((m) => ({ m, s: score(m), v: vendors.get(m.vendorId)! }))
    .filter(({ m, s, v }) => {
      if (s === 0) return false;
      if (f.cat !== "all" && m.category !== f.cat) return false;
      if (vendorId && m.vendorId !== vendorId) return false;
      if (f.price === "under3" && m.price >= 3000) return false;
      if (f.price === "3to7" && (m.price < 3000 || m.price > 7000)) return false;
      if (f.price === "over7" && m.price <= 7000) return false;
      if (f.maxMinutes && v.deliveryMinutes[1] > f.maxMinutes) return false;
      if (f.minRating && v.rating < f.minRating) return false;
      if (f.availableOnly && !m.available) return false;
      return true;
    });
  const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
    relevance: (a, b) => b.s - a.s || b.m.rating - a.m.rating,
    "price-asc": (a, b) => a.m.price - b.m.price,
    "price-desc": (a, b) => b.m.price - a.m.price,
    rating: (a, b) => b.m.rating - a.m.rating,
    fastest: (a, b) => a.v.deliveryMinutes[1] - b.v.deliveryMinutes[1],
  };
  return list.sort(by[f.sort]).map((x) => x.m);
}

export default function SearchPage() {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const [q, setQ] = useState("");
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheet, setSheet] = useState(false);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  const data = catalog.state.status === "ready" ? catalog.state.data : null;
  const term = q.trim().toLowerCase();
  const catLabel = (id: CategoryId) => data?.categories.find((c) => c.id === id)?.label ?? id;

  const results = useMemo(
    () => (data ? applyFilters(data.menu, catalog.vendors, catLabel, term, vendorId, filters) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, catalog.vendors, term, vendorId, filters],
  );
  const suggestions = useMemo(() => {
    if (!data || term.length < 2) return [];
    const vendors = data.vendors.filter((v) => v.name.toLowerCase().includes(term)).map((v) => ({ kind: "vendor" as const, label: v.name, id: v.id }));
    const dishes = data.menu.filter((m) => m.name.toLowerCase().includes(term)).map((m) => ({ kind: "dish" as const, label: m.name, id: m.id }));
    return [...vendors, ...dishes].slice(0, 6);
  }, [data, term]);
  // Ranked by the menu's own review counts, the only popularity signal there is.
  const popular = useMemo(() => (data ? [...data.menu].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5) : []), [data]);

  const active: { key: string; label: string; clear: () => void }[] = [];
  if (filters.cat !== "all") active.push({ key: "cat", label: catLabel(filters.cat), clear: () => setFilters({ ...filters, cat: "all" }) });
  if (filters.price !== "any") active.push({ key: "price", label: PRICES.find((p) => p[0] === filters.price)![1], clear: () => setFilters({ ...filters, price: "any" }) });
  if (filters.maxMinutes) active.push({ key: "time", label: `Under ${filters.maxMinutes} min`, clear: () => setFilters({ ...filters, maxMinutes: 0 }) });
  if (filters.minRating) active.push({ key: "rating", label: `Vendors ${filters.minRating.toFixed(1)}+`, clear: () => setFilters({ ...filters, minRating: 0 }) });
  if (filters.availableOnly) active.push({ key: "avail", label: "Available now", clear: () => setFilters({ ...filters, availableOnly: false }) });
  if (vendorId) active.push({ key: "vendor", label: catalog.vendors.get(vendorId)?.name ?? "Vendor", clear: () => setVendorId(null) });
  const filterCount = active.length - (vendorId ? 1 : 0);
  const browsing = !term && active.length === 0 && filters.sort === "relevance";

  const commit = (t: string) => {
    setQ(t);
    dispatch({ type: "addSearch", term: t });
    setFocused(false);
    input.current?.blur();
  };
  const resetAll = () => {
    setQ("");
    setVendorId(null);
    setFilters(NO_FILTERS);
  };

  return (
    <main className="pb-nav px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:mx-auto md:w-full md:max-w-3xl md:px-0 md:pt-10">
      <PageHeader title="Search" back={false} />

      {/* The search line: one strong rule, no box */}
      <div className="sticky top-0 z-20 -mx-5 mt-4 bg-cream px-5 pb-2 pt-2 md:top-[72px] md:mx-0 md:px-0">
        <div className="relative flex items-center gap-3">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) commit(q.trim());
            }}
            className={cx("flex h-14 min-w-0 flex-1 items-center gap-3 border-b-2 transition-colors", focused ? "border-burnt" : "border-ink")}
          >
            <SearchIcon className="size-5 shrink-0 text-ink" aria-hidden />
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
              placeholder="Jollof, suya, a vendor"
              aria-label="Search dishes, vendors or categories"
              enterKeyHint="search"
              className="h-full min-w-0 flex-1 bg-transparent font-[family-name:var(--font-display)] text-[20px] font-semibold tracking-[-0.01em] text-ink outline-none placeholder:font-medium placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search text" className="grid size-10 shrink-0 place-items-center rounded-[6px] text-muted-ink hover:bg-board/60">
                <X className="size-5" />
              </button>
            )}
          </form>
          <button
            onClick={() => setSheet(true)}
            aria-label={`Filters and sorting${filterCount ? `, ${filterCount} on` : ""}`}
            className={cx("relative grid size-12 shrink-0 place-items-center rounded-[6px] transition-colors", filterCount ? "bg-green text-white" : "text-ink ring-[1.5px] ring-inset ring-ink/70 hover:bg-board/60")}
          >
            <SlidersHorizontal className="size-5" />
            {filterCount > 0 && <span className="tabular absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-orange-strong text-[11px] font-bold text-white">{filterCount}</span>}
          </button>

          {focused && suggestions.length > 0 && (
            <ul role="listbox" aria-label="Suggestions" className="animate-fade absolute inset-x-0 top-[calc(100%+4px)] z-30 rounded-[6px] border-[1.5px] border-ink bg-cream py-1">
              {suggestions.map((s) => (
                <li key={s.kind + s.id}>
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
                        input.current?.blur();
                      } else commit(s.label);
                    }}
                    className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-[15px] text-ink hover:bg-board/60"
                  >
                    <span className="flex-1 truncate font-semibold">{s.label}</span>
                    <span className="t-support text-muted-ink">{s.kind === "vendor" ? "Vendor" : "Dish"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {catalog.state.status === "error" ? (
        <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
      ) : browsing ? (
        <div className="mt-6 flex flex-col gap-10">
          {state.recentSearches.length > 0 && (
            <section aria-labelledby="recent-h">
              <BoardHeading
                id="recent-h"
                action={
                  <button onClick={() => dispatch({ type: "clearSearches" })} className="t-button pb-0.5 text-green">
                    Clear
                  </button>
                }
              >
                Recent
              </BoardHeading>
              <ul>
                {state.recentSearches.map((t) => (
                  <li key={t}>
                    <button onClick={() => commit(t)} className="flex min-h-12 w-full items-center gap-3 border-b border-line text-left text-[16px] text-ink">
                      <Clock className="size-4 text-muted-ink" aria-hidden /> {t}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="popular-h">
            <BoardHeading id="popular-h">Most ordered</BoardHeading>
            <ol>
              {popular.map((m) => (
                <li key={m.id}>
                  <button onClick={() => commit(m.name)} className="flex min-h-14 w-full items-center justify-between gap-3 border-b border-dashed border-leader text-left">
                    <span className="t-card text-ink">{m.name}</span>
                    <span className="t-support shrink-0 text-muted-ink">{m.ratingCount} reviews</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          {data && (
            <section aria-labelledby="cat-h">
              <BoardHeading id="cat-h">By category</BoardHeading>
              {/* Big type as the index. No icons, no photo tiles. */}
              <ul className="grid grid-cols-2 gap-x-6">
                {data.categories.map((c) => {
                  const n = data.menu.filter((m) => m.category === c.id).length;
                  return (
                    <li key={c.id}>
                      <button onClick={() => setFilters({ ...NO_FILTERS, cat: c.id })} className="group flex w-full items-baseline justify-between gap-2 border-b border-line py-3 text-left">
                        <span className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.02em] text-ink group-hover:text-burnt-ink">{c.label}</span>
                        <span className="t-support tabular text-muted-ink">{n}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data && (
            <section aria-labelledby="vendors-h">
              <BoardHeading id="vendors-h">Kitchens near you</BoardHeading>
              <ul>
                {data.vendors.map((v) => (
                  <li key={v.id}>
                    <button onClick={() => setVendorId(v.id)} className="group flex min-h-16 w-full items-center gap-3 border-b border-line py-3 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="t-card block text-ink group-hover:text-burnt-ink">{v.name}</span>
                        <span className="t-support block text-muted-ink">
                          {v.area} · {v.deliveryMinutes[0]}-{v.deliveryMinutes[1]} min · ★ {v.rating.toFixed(1)} · {data.menu.filter((m) => m.vendorId === v.id).length} dishes
                        </span>
                      </span>
                      <ArrowUpRight className="size-5 shrink-0 text-muted-ink" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
            <p className="t-section text-ink" aria-live="polite">
              {results.length} {results.length === 1 ? "dish" : "dishes"}
              {term && <span className="font-[family-name:var(--font-body)] text-[15px] font-normal tracking-normal text-muted-ink"> for “{q.trim()}”</span>}
            </p>
            <button onClick={() => setSheet(true)} className="t-button text-green underline-offset-4 hover:underline">
              {SORTS.find((s) => s[0] === filters.sort)![1]}
            </button>
          </div>

          {active.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
              {active.map((f) => (
                <button key={f.key} onClick={f.clear} className="inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-green pl-3 pr-2 text-[13px] font-semibold text-white hover:bg-green-deep" aria-label={`Remove filter ${f.label}`}>
                  {f.label} <X className="size-3.5" aria-hidden />
                </button>
              ))}
            </div>
          )}

          {catalog.state.status === "loading" ? (
            <div>{[0, 1, 2].map((i) => <DishRowSkeleton key={i} />)}</div>
          ) : results.length === 0 ? (
            <Empty
              title="Nothing matches."
              body={term ? `We couldn't find “${q.trim()}”. Check the spelling, or try jollof, suya or amala.` : "No dish fits these filters. Remove one to see more."}
              action={
                <Button variant="secondary" onClick={resetAll}>
                  Clear search and filters
                </Button>
              }
            />
          ) : (
            <ul>{results.map((m) => <DishRow key={m.id} item={m} />)}</ul>
          )}
        </div>
      )}

      {sheet && data && (
        <FilterSheet
          value={filters}
          categories={data.categories}
          count={(f) => applyFilters(data.menu, catalog.vendors, catLabel, term, vendorId, f).length}
          onApply={(f) => {
            setFilters(f);
            setSheet(false);
          }}
          onClose={() => setSheet(false)}
        />
      )}
    </main>
  );
}

function FilterSheet({
  value,
  categories,
  count,
  onApply,
  onClose,
}: {
  value: Filters;
  categories: { id: CategoryId; label: string }[];
  count: (f: Filters) => number;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState(value);
  const n = count(f);
  const group = <K extends keyof Filters>(title: string, key: K, options: [Filters[K], string][]) => (
    <fieldset className="flex flex-col">
      <legend className="t-card mb-2.5 text-ink">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <Choice key={String(v)} active={f[key] === v} onClick={() => setF({ ...f, [key]: v })}>
            {l}
          </Choice>
        ))}
      </div>
    </fieldset>
  );
  return (
    <Sheet
      title="Filter and sort"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setF(NO_FILTERS)}>
            Reset
          </Button>
          <Button className="flex-[1.6]" disabled={n === 0} onClick={() => onApply(f)}>
            {n === 0 ? "No dishes match" : `Show ${n} ${n === 1 ? "dish" : "dishes"}`}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {group("Sort by", "sort", SORTS)}
        {group("Category", "cat", [["all", "All"], ...categories.map((c) => [c.id, c.label] as [CategoryId, string])])}
        {group("Price", "price", PRICES)}
        {group("Vendor rating", "minRating", [[0, "Any"], [4, "4.0 and up"], [4.5, "4.5 and up"]])}
        {group("Delivery time", "maxMinutes", [[0, "Any time"], [30, "Under 30 min"], [45, "Under 45 min"]])}
        {group("Availability", "availableOnly", [[false, "Show all"], [true, "Available now"]])}
      </div>
    </Sheet>
  );
}
