"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { Address, CartLine, Order, Profile } from "@/lib/types";
import { lineKey } from "@/lib/pricing";

/**
 * Client state for the prototype, saved to localStorage on this device.
 * When Supabase lands: profile and addresses move to auth.users + addresses,
 * orders to orders/order_items, favourites to a favourites table. Cart can stay local.
 */
type State = {
  profile: Profile | null;
  addresses: Address[];
  selectedAddressId: string | null;
  cart: CartLine[];
  promoCode: string | null;
  favourites: string[];
  orders: Order[];
  recentSearches: string[];
};

const EMPTY: State = {
  profile: null,
  addresses: [],
  selectedAddressId: null,
  cart: [],
  promoCode: null,
  favourites: [],
  orders: [],
  recentSearches: [],
};

type Action =
  | { type: "hydrate"; state: State }
  | { type: "signIn"; profile: Profile; address: Address }
  | { type: "updateProfile"; patch: Partial<Profile> }
  | { type: "logOut" }
  | { type: "saveAddress"; address: Address }
  | { type: "removeAddress"; id: string }
  | { type: "selectAddress"; id: string }
  | { type: "addToCart"; itemId: string; qty: number; optionIds: string[]; note: string }
  | { type: "setQty"; key: string; qty: number }
  | { type: "setNote"; key: string; note: string }
  | { type: "removeLine"; key: string }
  | { type: "clearCart" }
  | { type: "setPromo"; code: string | null }
  | { type: "toggleFavourite"; itemId: string }
  | { type: "placeOrder"; order: Order }
  | { type: "addSearch"; term: string }
  | { type: "clearSearches" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return a.state;
    case "signIn":
      return { ...s, profile: a.profile, addresses: [a.address], selectedAddressId: a.address.id };
    case "updateProfile":
      return s.profile ? { ...s, profile: { ...s.profile, ...a.patch } } : s;
    case "logOut":
      return EMPTY;
    case "saveAddress": {
      const exists = s.addresses.some((x) => x.id === a.address.id);
      const addresses = exists ? s.addresses.map((x) => (x.id === a.address.id ? a.address : x)) : [...s.addresses, a.address];
      return { ...s, addresses, selectedAddressId: s.selectedAddressId ?? a.address.id };
    }
    case "removeAddress": {
      const addresses = s.addresses.filter((x) => x.id !== a.id);
      const selectedAddressId = s.selectedAddressId === a.id ? addresses[0]?.id ?? null : s.selectedAddressId;
      return { ...s, addresses, selectedAddressId };
    }
    case "selectAddress":
      return { ...s, selectedAddressId: a.id };
    case "addToCart": {
      const key = lineKey(a.itemId, a.optionIds);
      const found = s.cart.find((l) => l.key === key);
      const cart = found
        ? s.cart.map((l) => (l.key === key ? { ...l, qty: l.qty + a.qty, note: a.note || l.note } : l))
        : [...s.cart, { key, itemId: a.itemId, qty: a.qty, optionIds: a.optionIds, note: a.note }];
      return { ...s, cart };
    }
    case "setQty":
      return {
        ...s,
        cart: a.qty <= 0 ? s.cart.filter((l) => l.key !== a.key) : s.cart.map((l) => (l.key === a.key ? { ...l, qty: Math.min(a.qty, 20) } : l)),
      };
    case "setNote":
      return { ...s, cart: s.cart.map((l) => (l.key === a.key ? { ...l, note: a.note } : l)) };
    case "removeLine":
      return { ...s, cart: s.cart.filter((l) => l.key !== a.key) };
    case "clearCart":
      return { ...s, cart: [], promoCode: null };
    case "setPromo":
      return { ...s, promoCode: a.code };
    case "toggleFavourite":
      return {
        ...s,
        favourites: s.favourites.includes(a.itemId) ? s.favourites.filter((x) => x !== a.itemId) : [a.itemId, ...s.favourites],
      };
    case "placeOrder":
      return { ...s, orders: [a.order, ...s.orders], cart: [], promoCode: null };
    case "addSearch": {
      const term = a.term.trim();
      if (!term) return s;
      return { ...s, recentSearches: [term, ...s.recentSearches.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6) };
    }
    case "clearSearches":
      return { ...s, recentSearches: [] };
  }
}

const KEY = "foodie:v1";

type Ctx = { state: State; dispatch: (a: Action) => void; ready: boolean; address: Address | null };
const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const [ready, setReady] = useState(false);

  // Read saved state after hydration so server and client render the same first frame.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: { ...EMPTY, ...JSON.parse(raw) } });
    } catch {
      /* storage blocked or corrupt: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode: keep working in memory */
    }
  }, [state, ready]);

  const address = useMemo(
    () => state.addresses.find((a) => a.id === state.selectedAddressId) ?? state.addresses[0] ?? null,
    [state.addresses, state.selectedAddressId],
  );

  return <StoreContext.Provider value={{ state, dispatch, ready, address }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

/** Re-renders on an interval so live order status stays current. */
export function useNow(ms = 2000) {
  const [now, setNow] = useState(() => Date.now());
  const tick = useCallback(() => setNow(Date.now()), []);
  useEffect(() => {
    const t = setInterval(tick, ms);
    return () => clearInterval(t);
  }, [ms, tick]);
  return now;
}
