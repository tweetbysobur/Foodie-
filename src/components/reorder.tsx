"use client";

import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";

/** Puts every still-available dish from a past order back in the cart, with the same options, then opens the cart. */
export function useReorder() {
  const { dispatch } = useStore();
  const { items } = useCatalog();
  const toast = useToast();
  const router = useRouter();
  return (order: Order) => {
    let added = 0;
    const skipped: string[] = [];
    for (const l of order.lines) {
      const item = items.get(l.itemId);
      if (!item || !item.available) {
        skipped.push(l.name);
        continue;
      }
      const optionIds = item.options.flatMap((g) => g.choices).filter((c) => l.optionLabels.includes(c.label)).map((c) => c.id);
      dispatch({ type: "addToCart", itemId: item.id, qty: l.qty, optionIds, note: l.note });
      added++;
    }
    if (skipped.length) toast(`${skipped.join(", ")} ${skipped.length === 1 ? "is" : "are"} sold out and was left out`, "error");
    if (added) router.push("/cart");
  };
}
