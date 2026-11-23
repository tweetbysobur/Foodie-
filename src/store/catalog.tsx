"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCatalog, type Catalog } from "@/lib/api";
import type { MenuItem, Vendor } from "@/lib/types";

type CatalogState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Catalog };

type Ctx = {
  state: CatalogState;
  retry: () => void;
  items: Map<string, MenuItem>;
  vendors: Map<string, Vendor>;
};

const CatalogContext = createContext<Ctx | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({ status: "loading" });
  const load = useCallback(() => {
    setState({ status: "loading" });
    fetchCatalog()
      .then((data) => setState({ status: "ready", data }))
      .catch((e: Error) => setState({ status: "error", message: e.message }));
  }, []);
  useEffect(load, [load]);

  const items = useMemo(() => new Map(state.status === "ready" ? state.data.menu.map((m) => [m.id, m]) : []), [state]);
  const vendors = useMemo(() => new Map(state.status === "ready" ? state.data.vendors.map((v) => [v.id, v]) : []), [state]);

  return <CatalogContext.Provider value={{ state, retry: load, items, vendors }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
