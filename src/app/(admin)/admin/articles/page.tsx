import type { Metadata } from 'next'
import Link from 'next/link'
import { adminGetAllArticles } from '@/lib/db'
import { AdminArticlesTable } from '@/components/admin/AdminArticlesTable'

export const metadata: Metadata = { title: 'Articles | Admin' }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ status?: string }> }

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { status } = await searchParams
  const allArticles = await adminGetAllArticles()

  const drafts = allArticles.filter((a) => a.status === 'draft')
  const published = allArticles.filter((a) => a.status === 'published')
  const inReview = allArticles.filter((a) => a.status === 'pending_review')

  const activeTab = status === 'draft' ? 'draft'
    : status === 'published' ? 'published'
    : status === 'pending_review' ? 'pending_review'
    : 'all'

  const articles = activeTab === 'draft' ? drafts
    : activeTab === 'published' ? published
    : activeTab === 'pending_review' ? inReview
    : allArticles

  const tabs = [
    { key: 'all', label: 'All', count: allArticles.length, href: '/admin/articles' },
    { key: 'published', label: 'Published', count: published.length, href: '/admin/articles?status=published' },
    { key: 'pending_review', label: 'In Review', count: inReview.length, href: '/admin/articles?status=pending_review' },
    { key: 'draft', label: 'Drafts', count: drafts.length, href: '/admin/articles?status=draft' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors"
        >
          + New article
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-[#E5E5E0]">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[#E8A020] text-[#1A1A1A]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#E8A020] text-white' : 'bg-[#E5E5E0] text-[#6B6B6B]'}`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      <AdminArticlesTable articles={articles} activeTab={activeTab} />
    </div>
  )
}
