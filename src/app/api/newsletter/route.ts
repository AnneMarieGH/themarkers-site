import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { email, firstName } = parsed.data

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, first_name: firstName, subscribed_at: new Date().toISOString() }, { onConflict: 'email' })

  if (error) {
    console.error('[newsletter] supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }

  // Optional: trigger Loops or Resend welcome email here
  // await triggerLoopsSubscriber({ email, firstName })

  return NextResponse.json({ success: true })
}
