import { cookies } from 'next/headers'
import { supabase } from './supabase'

const MEMBER_COOKIE = 'tea_member_id'

export async function checkMembership(): Promise<boolean> {
  const cookieStore = await cookies()
  const email = cookieStore.get(MEMBER_COOKIE)?.value
  if (!email) return false
  const { data } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle()
  return data?.status === 'active' || data?.status === 'trialing'
}
