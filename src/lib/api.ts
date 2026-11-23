import { CATEGORIES, MENU, VENDORS } from "./mock-data";
import type { Category, MenuItem, Vendor } from "./types";

/**
 * Data access. Every screen reads through here, never from mock-data directly.
 * To go live, replace each body with a Supabase query, for example:
 *   const { data, error } = await supabase.from("menu_items").select("*, option_groups(*, choices(*))")
 * The return types stay the same.
 */
export type Catalog = { categories: Category[]; vendors: Vendor[]; menu: MenuItem[] };

const NETWORK_DELAY_MS = 350;

export async function fetchCatalog(): Promise<Catalog> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS));
  if (typeof window !== "undefined" && window.location.search.includes("simulate=error")) {
    throw new Error("Could not reach Foodie. Check your connection and try again.");
  }
  return { categories: CATEGORIES, vendors: VENDORS, menu: MENU };
}

export const ALL_ITEM_IDS = MENU.map((m) => m.id);
