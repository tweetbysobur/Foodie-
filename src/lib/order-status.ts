import type { Order, OrderStatus } from "./types";

export const STATUS_STEPS: { id: OrderStatus; label: string; detail: string }[] = [
  { id: "placed", label: "Order placed", detail: "Waiting for the vendor to confirm" },
  { id: "confirmed", label: "Vendor confirmed", detail: "The kitchen has your order" },
  { id: "preparing", label: "Preparing your food", detail: "Your meal is being cooked" },
  { id: "ready", label: "Ready for pickup", detail: "A rider is collecting it" },
  { id: "out_for_delivery", label: "Out for delivery", detail: "Your rider is on the way" },
  { id: "delivered", label: "Delivered", detail: "Enjoy your meal" },
];

/**
 * Live tracking needs vendors and riders on the backend (subscribe to orders.status).
 * Until then an order stays at "Order placed". Set NEXT_PUBLIC_DEMO_TRACKING=1 to walk
 * through the stages on a timer for demos; the screen then says it is a demo.
 */
export const DEMO_TRACKING = process.env.NEXT_PUBLIC_DEMO_TRACKING === "1";
const DEMO_SCHEDULE = [0, 20, 45, 90, 140, 240];

export type StatusView =
  | { kind: "cancelled"; index: -1 }
  | { kind: "active"; index: number; step: (typeof STATUS_STEPS)[number] }
  | { kind: "delivered"; index: number; step: (typeof STATUS_STEPS)[number] };

export function orderStatus(order: Order, now: number): StatusView {
  if (order.cancelledAt) return { kind: "cancelled", index: -1 };
  let index = 0;
  if (DEMO_TRACKING) {
    const elapsed = (now - order.placedAt) / 1000;
    DEMO_SCHEDULE.forEach((s, i) => {
      if (elapsed >= s) index = i;
    });
  }
  const step = STATUS_STEPS[index];
  return index === STATUS_STEPS.length - 1 ? { kind: "delivered", index, step } : { kind: "active", index, step };
}

/** A customer can cancel until the vendor confirms. */
export const canCancel = (v: StatusView) => v.kind === "active" && v.index === 0;

/**
 * No vendor or rider system is connected yet, so placed orders are not sent to a kitchen.
 * Screens say so while this is false. Flip it when orders reach vendors through the backend.
 */
export const VENDORS_CONNECTED = false;
