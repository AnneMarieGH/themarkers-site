import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email(),
  plan: z.enum(['monthly', 'annual']),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { email, plan } = parsed.data
  const planConfig = PLANS[plan as PlanKey]

  if (!planConfig.priceId) {
    return NextResponse.json({ error: 'Plan not configured.' }, { status: 503 })
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: existing } = await supabase
    .from('subscribers')
    .select('stripe_customer_id')
    .eq('email', email)
    .maybeSingle()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: existing?.stripe_customer_id ?? undefined,
    customer_email: existing?.stripe_customer_id ? undefined : email,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/membership`,
    metadata: { email, plan },
    subscription_data: {
      metadata: { email, plan },
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
