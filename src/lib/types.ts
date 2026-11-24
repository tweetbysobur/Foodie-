/**
 * Domain types. Field names mirror the planned Supabase tables
 * (vendors, menu_items, option_groups, orders, order_items, addresses)
 * so mock data can be swapped for API responses without touching the UI.
 */

export type CategoryId =
  | "rice"
  | "soups"
  | "grills"
  | "fast-food"
  | "swallow"
  | "snacks"
  | "drinks"
  | "desserts";

export type Category = { id: CategoryId; label: string };

export type Vendor = {
  id: string;
  name: string;
  area: string;
  /** Minutes, low and high estimate */
  deliveryMinutes: [number, number];
  /** Naira */
  deliveryFee: number;
  rating: number;
  ratingCount: number;
};

export type OptionChoice = { id: string; label: string; price: number };

export type OptionGroup = {
  id: string;
  name: string;
  /** single: pick exactly one. multi: pick any. */
  type: "single" | "multi";
  choices: OptionChoice[];
};

export type Photo = {
  src: string;
  alt: string;
  credit: { author: string; licence: string; url: string };
};

export type MenuItem = {
  id: string;
  name: string;
  vendorId: string;
  category: CategoryId;
  /** Naira, base price before options */
  price: number;
  description: string;
  prepMinutes: number;
  rating: number;
  ratingCount: number;
  available: boolean;
  bestSeller: boolean;
  /** Only dishes with a strong photo have one. The rest show as text. */
  photo?: Photo;
  options: OptionGroup[];
};

export type CartLine = {
  /** itemId plus chosen options, so the same dish with other options is its own line */
  key: string;
  itemId: string;
  qty: number;
  optionIds: string[];
  note: string;
};

export type Address = {
  id: string;
  label: string;
  line: string;
  area: string;
  city: string;
};

export type PaymentMethodId = "pay_on_delivery" | "card" | "bank_transfer";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered";

export type OrderLine = {
  itemId: string;
  name: string;
  vendorId: string;
  qty: number;
  unitPrice: number;
  optionLabels: string[];
  note: string;
};

export type Order = {
  id: string;
  reference: string;
  lines: OrderLine[];
  vendorIds: string[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode: string | null;
  paymentMethod: PaymentMethodId;
  address: Address;
  contact: { name: string; phone: string; instructions: string };
  placedAt: number;
  etaMinutes: [number, number];
  /** Set when the customer cancels before the vendor confirms. */
  cancelledAt?: number;
};

export type Profile = {
  name: string;
  phone: string;
  email?: string;
  photo: string | null;
  preferredPayment: PaymentMethodId;
};
