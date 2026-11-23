import type { Order, OrderStatus } from "./types";

export const STATUS_STEPS: { id: OrderStatus; label: string }[] = [
  { id: "placed", label: "Order placed" },
  { id: "confirmed", label: "Vendor confirmed" },
  { id: "preparing", label: "Preparing your food" },
  { id: "ready", label: "Ready for pickup" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
];

/**
 * Vendors and riders are not connected yet, so status advances on this demo schedule
 * (seconds after placing). Replace with a realtime subscription to orders.status.
 */
const DEMO_SCHEDULE = [0, 20, 45, 90, 140, 240];

export const IS_DEMO_TRACKING = true;

export function orderStatus(order: Order, now: number) {
  const elapsed = (now - order.placedAt) / 1000;
  let index = 0;
  DEMO_SCHEDULE.forEach((s, i) => {
    if (elapsed >= s) index = i;
  });
  return { index, step: STATUS_STEPS[index], done: index === STATUS_STEPS.length - 1 };
}
