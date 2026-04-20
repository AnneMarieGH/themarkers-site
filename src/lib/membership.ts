import { cookies } from 'next/headers'
import { supabase } from './supabase'

const MEMBER_COOKIE = 'tea_member_id'

export async function getActiveMemberEmail(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(MEMBER_COOKIE)?.value ?? null
}

export async function isMemberActive(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle()
  return data?.status === 'active' || data?.status === 'trialing'
}

export async function checkMembership(): Promise<boolean> {
  const email = await getActiveMemberEmail()
  if (!email) return false
  return isMemberActive(email)
}
