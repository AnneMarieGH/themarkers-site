import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata: Metadata = { title: 'Admin | The Markers' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex">
      <AdminNav role={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-8 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
