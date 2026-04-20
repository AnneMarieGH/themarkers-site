import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
