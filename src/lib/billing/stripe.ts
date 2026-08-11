import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Lazily-constructed Stripe client. Lazy so that importing this module during a
 * build without secrets present doesn't throw — only actually *using* Stripe does.
 */
export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  cached = new Stripe(key, { typescript: true });
  return cached;
}

/** Absolute base URL for building Stripe return/cancel links. */
export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
