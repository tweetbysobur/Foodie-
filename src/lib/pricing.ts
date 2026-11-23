import type { CartLine, MenuItem, Vendor } from "./types";
import { promoDiscount } from "./promo";

export function unitPrice(item: MenuItem, optionIds: string[]) {
  const extras = item.options.flatMap((g) => g.choices).filter((c) => optionIds.includes(c.id));
  return item.price + extras.reduce((s, c) => s + c.price, 0);
}

export function optionLabels(item: MenuItem, optionIds: string[]) {
  return item.options.flatMap((g) => g.choices).filter((c) => optionIds.includes(c.id)).map((c) => c.label);
}

/** Each vendor in the cart is one delivery, so each adds its own fee. */
export function cartTotals(
  lines: CartLine[],
  items: Map<string, MenuItem>,
  vendors: Map<string, Vendor>,
  promoCode: string | null,
  pastOrders: number,
) {
  let subtotal = 0;
  let count = 0;
  const vendorIds = new Set<string>();
  for (const l of lines) {
    const item = items.get(l.itemId);
    if (!item) continue;
    subtotal += unitPrice(item, l.optionIds) * l.qty;
    count += l.qty;
    vendorIds.add(item.vendorId);
  }
  const deliveryFee = [...vendorIds].reduce((s, id) => s + (vendors.get(id)?.deliveryFee ?? 0), 0);
  const discount = promoDiscount(promoCode, subtotal, pastOrders);
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount, count, vendorIds: [...vendorIds] };
}

export const lineKey = (itemId: string, optionIds: string[]) => [itemId, ...[...optionIds].sort()].join("|");
