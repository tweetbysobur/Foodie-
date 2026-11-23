import { CookingPot, CupSoda, Drumstick, IceCreamCone, Sandwich, Soup, Cookie, UtensilsCrossed, Wheat } from "lucide-react";
import type { CategoryId } from "./types";

export const CATEGORY_ICONS: Record<CategoryId | "all", typeof Soup> = {
  all: UtensilsCrossed,
  rice: CookingPot,
  soups: Soup,
  grills: Drumstick,
  "fast-food": Sandwich,
  swallow: Wheat,
  snacks: Cookie,
  drinks: CupSoda,
  desserts: IceCreamCone,
};
