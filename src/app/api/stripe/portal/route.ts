import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { email } = parsed.data
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('stripe_customer_id')
    .eq('email', email)
    .maybeSingle()

  if (!subscriber?.stripe_customer_id) {
    return NextResponse.json({ error: 'No active membership found for that email.' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscriber.stripe_customer_id,
    return_url: `${origin}/membership`,
  })

  return NextResponse.json({ url: session.url })
}
