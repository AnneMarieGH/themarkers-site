import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminGetArticleById, getCategories } from '@/lib/db'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

export const metadata: Metadata = { title: 'Edit Article | Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const [article, categories] = await Promise.all([
    adminGetArticleById(Number(id)),
    getCategories(),
  ])
  if (!article) notFound()
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Edit article</h1>
      <ArticleEditor article={article} categories={categories} />
    </div>
  )
}
