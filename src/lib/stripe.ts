import Stripe from "stripe";

export const isStripeEnabled =
  process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true" &&
  Boolean(process.env.STRIPE_SECRET_KEY);

export function getStripeClient(): Stripe | null {
  if (!isStripeEnabled || !process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
  });
}
