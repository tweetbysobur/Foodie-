"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Search as SearchIcon, SlidersHorizontal, Star, Store, TrendingUp, X } from "lucide-react";
import type { CategoryId, MenuItem, Vendor } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { FoodRow, FoodRowSkeleton } from "@/components/food";
import { Button, Chip, Empty, ErrorState, FoodImage, Sheet, cx } from "@/components/ui";

type Filters = { cat: CategoryId | "all"; price: "any" | "under3" | "3to7" | "over7"; maxMinutes: 0 | 30 | 45; minRating: 0 | 4 | 4.5; availableOnly: boolean; sort: Sort };
type Sort = "relevance" | "price-asc" | "price-desc" | "rating" | "fastest";
const NO_FILTERS: Filters = { cat: "all", price: "any", maxMinutes: 0, minRating: 0, availableOnly: false, sort: "relevance" };
const SORTS: [Sort, string][] = [
  ["relevance", "Best match"],
  ["rating", "Top rated"],
  ["fastest", "Fastest delivery"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
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

  const matchedVendors = useMemo(() => (data && term.length >= 2 ? data.vendors.filter((v) => v.name.toLowerCase().includes(term)) : []), [data, term]);
  // "Popular" comes from the menu's own rating counts, the only popularity signal there is.
  const popular = useMemo(() => (data ? [...data.menu].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 6) : []), [data]);

  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (filters.cat !== "all") activeFilters.push({ key: "cat", label: catLabel(filters.cat), clear: () => setFilters({ ...filters, cat: "all" }) });
  if (filters.price !== "any") activeFilters.push({ key: "price", label: PRICES.find((p) => p[0] === filters.price)![1], clear: () => setFilters({ ...filters, price: "any" }) });
  if (filters.maxMinutes) activeFilters.push({ key: "time", label: `Under ${filters.maxMinutes} min`, clear: () => setFilters({ ...filters, maxMinutes: 0 }) });
  if (filters.minRating) activeFilters.push({ key: "rating", label: `Vendors ${filters.minRating.toFixed(1)}+`, clear: () => setFilters({ ...filters, minRating: 0 }) });
  if (filters.availableOnly) activeFilters.push({ key: "avail", label: "Available now", clear: () => setFilters({ ...filters, availableOnly: false }) });
  if (vendorId) activeFilters.push({ key: "vendor", label: catalog.vendors.get(vendorId)?.name ?? "Vendor", clear: () => setVendorId(null) });
  const filterCount = activeFilters.length - (vendorId ? 1 : 0);

  const browsing = !term && activeFilters.length === 0;
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
    <main className="pb-nav flex flex-col gap-7 md:mx-auto md:w-full md:max-w-4xl md:pt-6">
      {/* Search field: the page's one big element */}
      <div className="sticky top-0 z-20 bg-cream/95 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur md:top-[72px] md:px-0 md:pt-4">
        <h1 className="t-page mb-3 text-ink">Search</h1>
        <div className="relative flex items-center gap-2">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) commit(q.trim());
            }}
            className={cx(
              "flex h-14 min-w-0 flex-1 items-center gap-2.5 rounded-[18px] bg-surface pl-4 pr-1.5 shadow-soft transition-shadow",
              focused && "ring-2 ring-green",
            )}
          >
            <SearchIcon className="size-5 shrink-0 text-green" aria-hidden />
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
              placeholder="Meals, vendors or categories"
              aria-label="Search meals, vendors or categories"
              enterKeyHint="search"
              className="t-body h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search text" className="grid size-10 shrink-0 place-items-center rounded-full text-muted-ink hover:bg-cream">
                <X className="size-[18px]" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSheet(true)}
              aria-label={`Filters and sorting${filterCount ? `, ${filterCount} on` : ""}`}
              className={cx("relative grid size-11 shrink-0 place-items-center rounded-[14px] transition-colors", filterCount ? "bg-green text-white" : "bg-sage text-green hover:bg-sage/70")}
            >
              <SlidersHorizontal className="size-5" />
              {filterCount > 0 && (
                <span className="tabular absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-orange-strong text-[11px] font-bold text-white ring-2 ring-surface">{filterCount}</span>
              )}
            </button>
          </form>
          {(focused || q) && (
            <button
              onClick={() => {
                setQ("");
                setFocused(false);
                input.current?.blur();
              }}
              className="t-button h-11 shrink-0 px-1 text-green"
            >
              Cancel
            </button>
          )}

          {focused && suggestions.length > 0 && (
            <ul role="listbox" aria-label="Suggestions" className="animate-fade absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] bg-surface py-1.5 shadow-float">
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
                    className="t-body flex min-h-12 w-full items-center gap-3 px-4 text-left text-[15px] text-ink hover:bg-cream"
                  >
                    {s.kind === "vendor" ? <Store className="size-4 text-green" aria-hidden /> : <SearchIcon className="size-4 text-muted" aria-hidden />}
                    <span className="flex-1 truncate">{s.label}</span>
                    <span className="t-support text-muted-ink">{s.kind === "vendor" ? "Vendor" : "Dish"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {catalog.state.status === "error" ? (
        <div className="px-5 md:px-0">
          <ErrorState message={catalog.state.message} onRetry={catalog.retry} />
        </div>
      ) : browsing ? (
        <div className="flex flex-col gap-8 px-5 md:px-0">
          {state.recentSearches.length > 0 && (
            <section aria-labelledby="recent-h" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 id="recent-h" className="t-section text-ink">Recent</h2>
                <button onClick={() => dispatch({ type: "clearSearches" })} className="t-button min-h-11 px-1 text-green">
                  Clear
                </button>
              </div>
              <ul className="flex flex-col">
                {state.recentSearches.map((t) => (
                  <li key={t}>
                    <button onClick={() => commit(t)} className="t-body flex min-h-12 w-full items-center gap-3 border-b border-line text-left text-[15px] text-ink">
                      <Clock className="size-4 text-muted" aria-hidden /> {t}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="popular-h" className="flex flex-col gap-3">
            <h2 id="popular-h" className="t-section text-ink">Popular dishes</h2>
            <div className="flex flex-wrap gap-2">
              {popular.map((m) => (
                <button key={m.id} onClick={() => commit(m.name)} className="t-button inline-flex h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-green shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-sage/50">
                  <TrendingUp className="size-4 text-orange-strong" aria-hidden />
                  {m.name}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="cat-h" className="flex flex-col gap-3">
            <h2 id="cat-h" className="t-section text-ink">Browse by category</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data
                ? data.categories.map((c) => {
                    const dish = data.menu.find((m) => m.category === c.id && m.bestSeller) ?? data.menu.find((m) => m.category === c.id);
                    const count = data.menu.filter((m) => m.category === c.id).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setFilters({ ...NO_FILTERS, cat: c.id })}
                        className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] p-3 text-left"
                      >
                        {dish && (
                          <span className="absolute inset-0 -z-10">
                            <FoodImage photo={dish.photo} sizes="(min-width: 768px) 220px, 45vw" className="size-full [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105" />
                          </span>
                        )}
                        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1e3a2b]/85 via-[#1e3a2b]/25 to-transparent" />
                        <span className="t-card text-white">{c.label}</span>
                        <span className="t-support text-white/90">
                          {count} {count === 1 ? "dish" : "dishes"}
                        </span>
                      </button>
                    );
                  })
                : [0, 1, 2, 3].map((i) => <div key={i} className="skeleton aspect-[4/3] rounded-[var(--radius-card)]" />)}
            </div>
          </section>

          {data && (
            <section aria-labelledby="vendors-h" className="flex flex-col gap-3">
              <h2 id="vendors-h" className="t-section text-ink">Vendors near you</h2>
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {data.vendors.map((v) => (
                  <VendorCard key={v.id} vendor={v} dishes={data.menu.filter((m) => m.vendorId === v.id).length} onClick={() => setVendorId(v.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-5 md:px-0">
          {matchedVendors.length > 0 && !vendorId && (
            <section aria-label="Matching vendors" className="flex flex-col gap-2.5">
              {matchedVendors.map((v) => (
                <VendorCard key={v.id} vendor={v} dishes={data!.menu.filter((m) => m.vendorId === v.id).length} onClick={() => { setVendorId(v.id); setQ(""); }} />
              ))}
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="t-card text-ink" aria-live="polite">
              {results.length} {results.length === 1 ? "dish" : "dishes"}
              {term && <span className="font-normal text-muted-ink"> for “{q.trim()}”</span>}
            </p>
            <button onClick={() => setSheet(true)} className="t-button inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-green hover:bg-sage/50">
              {SORTS.find((s) => s[0] === filters.sort)![1]}
              <SlidersHorizontal className="size-4" aria-hidden />
            </button>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Active filters">
              {activeFilters.map((f) => (
                <button key={f.key} onClick={f.clear} className="t-button inline-flex h-9 items-center gap-1.5 rounded-full bg-green pl-3.5 pr-2.5 text-[13px] text-white hover:bg-green-deep" aria-label={`Remove filter ${f.label}`}>
                  {f.label} <X className="size-3.5" aria-hidden />
                </button>
              ))}
            </div>
          )}

          {catalog.state.status === "loading" ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{[0, 1, 2].map((i) => <FoodRowSkeleton key={i} />)}</div>
          ) : results.length === 0 ? (
            <Empty
              title="No dishes match"
              body={term ? `We couldn't find “${q.trim()}”. Check the spelling, or try jollof, suya or amala.` : "Nothing fits these filters. Remove one to see more dishes."}
              action={
                <Button variant="secondary" onClick={resetAll}>
                  Clear search and filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{results.map((m) => <FoodRow key={m.id} item={m} />)}</div>
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

function VendorCard({ vendor, dishes, onClick }: { vendor: Vendor; dishes: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-[72px] items-center gap-3.5 rounded-[var(--radius-card)] bg-surface px-4 py-3 text-left shadow-soft transition-colors hover:bg-sage/30">
      <Store className="size-6 shrink-0 text-green" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="t-card block truncate text-ink">{vendor.name}</span>
        <span className="t-support flex flex-wrap items-center gap-x-3 text-muted-ink">
          <span>{vendor.area}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-orange text-orange" aria-hidden />
            <span className="font-medium text-ink">{vendor.rating.toFixed(1)}</span>
          </span>
          <span>
            {vendor.deliveryMinutes[0]}-{vendor.deliveryMinutes[1]} min
          </span>
          <span>
            {dishes} {dishes === 1 ? "dish" : "dishes"}
          </span>
        </span>
      </span>
    </button>
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
  const group = <K extends keyof Filters>(title: string, key: K, options: [Filters[K], string][], icons?: boolean) => (
    <fieldset className="flex flex-col">
      <legend className="t-card mb-2.5 text-ink">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <Chip key={String(v)} active={f[key] === v} onClick={() => setF({ ...f, [key]: v })} icon={icons ? CATEGORY_ICONS[v as CategoryId | "all"] : undefined}>
            {l}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
  return (
    <Sheet
      title="Filters"
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
      <div className="flex flex-col gap-6 pt-1">
        {group("Sort by", "sort", SORTS)}
        {group("Category", "cat", [["all", "All"], ...categories.map((c) => [c.id, c.label] as [CategoryId, string])], true)}
        {group("Price", "price", PRICES)}
        {group("Vendor rating", "minRating", [[0, "Any"], [4, "4.0 and up"], [4.5, "4.5 and up"]])}
        {group("Delivery time", "maxMinutes", [[0, "Any time"], [30, "Under 30 min"], [45, "Under 45 min"]])}
        {group("Availability", "availableOnly", [[false, "Show all"], [true, "Available now"]])}
      </div>
    </Sheet>
  );
}
