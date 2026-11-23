import type { PaymentMethodId } from "./types";

/**
 * Payment methods. Only pay on delivery is live: nothing is charged in the app.
 * Card and bank transfer need a gateway (for example Paystack or Flutterwave).
 * When one is connected, implement PaymentProvider and flip `available`.
 * The app never shows a payment as successful without a provider confirming it.
 */
export type PaymentMethod = { id: PaymentMethodId; label: string; detail: string; available: boolean };

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pay_on_delivery", label: "Pay on delivery", detail: "Cash or transfer to the rider when your food arrives", available: true },
  { id: "card", label: "Card", detail: "Debit or credit card", available: false },
  { id: "bank_transfer", label: "Bank transfer", detail: "Pay into a one-time account", available: false },
];

export interface PaymentProvider {
  id: Exclude<PaymentMethodId, "pay_on_delivery">;
  /** Starts a charge and returns a reference. Success comes only from the provider webhook. */
  initialise(input: { orderId: string; amount: number; email?: string }): Promise<{ reference: string; redirectUrl?: string }>;
  verify(reference: string): Promise<"pending" | "success" | "failed">;
}

export const paymentLabel = (id: PaymentMethodId) => PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
