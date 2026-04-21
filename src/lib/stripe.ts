import Stripe from 'stripe'

// Stripe is used for THE-4 (subscription billing) — not required for MVP content site.
if (process.env.NODE_ENV === 'production' && !process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set — Stripe features unavailable.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder', {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export const PLANS = {
  monthly: {
    name: 'Monthly Membership',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? '',
    amount: 1500,
    interval: 'month' as const,
    description: 'Full access to all premium content, events, and community.',
  },
  annual: {
    name: 'Annual Membership',
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID ?? '',
    amount: 12000,
    interval: 'year' as const,
    description: 'Everything in Monthly, billed annually. Save 33%.',
  },
} as const

export type PlanKey = keyof typeof PLANS
