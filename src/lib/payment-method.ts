export const PAYMENT_PROVIDERS = ["MOBILE_MONEY", "AIRTEL_MONEY", "MTN", "ORANGE_MONEY", "PAYPAL", "PAYONEER", "USDT"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
export function isPaymentProvider(value: unknown): value is PaymentProvider { return typeof value === "string" && PAYMENT_PROVIDERS.includes(value as PaymentProvider); }
