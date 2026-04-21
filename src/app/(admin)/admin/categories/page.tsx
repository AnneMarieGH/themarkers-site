import type { Metadata } from 'next'
import { getCategories } from '@/lib/db'
import { CategoriesManager } from '@/components/admin/CategoriesManager'

export const metadata: Metadata = { title: 'Categories | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Categories</h1>
      <CategoriesManager categories={categories} />
    </div>
  )
}
