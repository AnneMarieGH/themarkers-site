import type { Metadata } from 'next'
import { getCategories } from '@/lib/db'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

export const metadata: Metadata = { title: 'New Article | Admin' }

export default async function NewArticlePage() {
  const categories = await getCategories()
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">New article</h1>
      <ArticleEditor categories={categories} />
    </div>
  )
}
