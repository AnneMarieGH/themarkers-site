import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MediaLibrary } from '@/components/admin/MediaLibrary'

export const metadata: Metadata = { title: 'Media | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Media Library</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Upload and manage images</p>
      </div>
      <MediaLibrary />
    </div>
  )
}
