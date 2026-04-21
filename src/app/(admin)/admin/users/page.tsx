import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UsersManager } from '@/components/admin/UsersManager'
import type { AdminUser } from '@/lib/types'

export const metadata: Metadata = { title: 'Users | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (session?.role !== 'admin') redirect('/admin/articles')

  const { data: users } = await supabase
    .from('admin_users')
    .select('id, email, name, role, created_at')
    .order('created_at')

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Users</h1>
      <UsersManager users={(users ?? []) as AdminUser[]} />
    </div>
  )
}
