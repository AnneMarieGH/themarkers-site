import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id.' }, { status: 400 })

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const email = session.metadata?.email ?? session.customer_email

  if (!email || session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Session not paid.' }, { status: 400 })
  }

  const response = NextResponse.json({ email })
  response.cookies.set('tea_member_id', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return response
}
