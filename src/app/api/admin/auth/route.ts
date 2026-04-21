import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { createSession, SESSION_COOKIE } from '@/lib/auth'
import type { SessionPayload } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const isSeeded = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// Dev-only seed credentials — only active when Supabase is not provisioned
const DEV_USER = { id: 'dev-admin', email: 'admin@themarkers.com.au', role: 'admin' as const, password: 'markers2025' }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const { email, password } = parsed.data

  if (isSeeded) {
    if (email.toLowerCase() !== DEV_USER.email || password !== DEV_USER.password) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }
    const payload: SessionPayload = { userId: DEV_USER.id, email: DEV_USER.email, role: DEV_USER.role }
    const token = await createSession(payload)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
    return res
  }

  const { data: user } = await supabase
    .from('admin_users')
    .select('id, email, name, role, password_hash')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

  const payload: SessionPayload = { userId: user.id, email: user.email, role: user.role }
  const token = await createSession(payload)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
