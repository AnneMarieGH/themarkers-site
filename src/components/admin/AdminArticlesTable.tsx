'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Article } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'

function readTime(content?: string | null) {
  if (!content) return 1
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))
}

function statusStyle(status: string) {
  if (status === 'published') return 'bg-green-100 text-green-700'
  if (status === 'pending_review') return 'bg-blue-100 text-blue-700'
  return 'bg-yellow-100 text-yellow-700'
}

function statusLabel(status: string) {
  if (status === 'pending_review') return 'In Review'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

interface Props {
  articles: Article[]
  activeTab: string
}

export function AdminArticlesTable({ articles, activeTab }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [optimisticFeatured, setOptimisticFeatured] = useState<Record<number, boolean>>({})
  const [bulkWorking, setBulkWorking] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return articles
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.author_name ?? '').toLowerCase().includes(q) ||
        (a.category?.title ?? '').toLowerCase().includes(q),
    )
  }, [articles, search])

  const allSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((a) => a.id)))
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function toggleFeatured(article: Article) {
    const newVal = !(optimisticFeatured[article.id] ?? article.is_featured)
    setOptimisticFeatured((prev) => ({ ...prev, [article.id]: newVal }))
    await fetch(`/api/admin/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: newVal }),
    })
    startTransition(() => router.refresh())
  }

  async function bulkAction(newStatus: 'published' | 'draft') {
    if (selected.size === 0) return
    setBulkWorking(true)
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/admin/articles/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }),
      ),
    )
    setSelected(new Set())
    setBulkWorking(false)
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {/* Search + bulk actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B6B6B]">{selected.size} selected</span>
            <button
              onClick={() => bulkAction('published')}
              disabled={bulkWorking}
              className="px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-sm hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              Bulk Publish
            </button>
            <button
              onClick={() => bulkAction('draft')}
              disabled={bulkWorking}
              className="px-3 py-2 bg-[#6B6B6B] text-white text-xs font-semibold rounded-sm hover:bg-[#4A4A4A] disabled:opacity-60 transition-colors"
            >
              Bulk Unpublish
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-sm border border-[#E5E5E0] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#6B6B6B]">
            <p className="font-serif text-lg mb-2">{search ? 'No results' : activeTab === 'draft' ? 'No drafts' : activeTab === 'pending_review' ? 'No articles in review' : 'No articles yet'}</p>
            <p className="text-sm">{search ? 'Try a different search term.' : 'Create your first article to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E5E5E0] bg-[#F5F5F3]">
                <tr>
                  <th className="px-3 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="px-3 py-3 w-12"></th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider hidden lg:table-cell">Read</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider hidden md:table-cell">Updated</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider hidden md:table-cell">Featured</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {filtered.map((article) => {
                  const isFeatured = optimisticFeatured[article.id] ?? article.is_featured
                  return (
                    <tr key={article.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(article.id)}
                          onChange={() => toggleOne(article.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-3 py-3">
                        {article.cover_image ? (
                          <div className="relative w-10 h-10 rounded-sm overflow-hidden flex-shrink-0">
                            <Image src={article.cover_image} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-sm bg-[#E5E5E0] flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#9B9B9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium line-clamp-1">{article.title}</p>
                        {article.author_name && <p className="text-xs text-[#6B6B6B] mt-0.5">{article.author_name}</p>}
                      </td>
                      <td className="px-4 py-3 text-[#6B6B6B] hidden sm:table-cell">{article.category?.title ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold ${statusStyle(article.status)}`}>
                          {statusLabel(article.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B6B6B] hidden lg:table-cell whitespace-nowrap">
                        {readTime(article.content)} min
                      </td>
                      <td className="px-4 py-3 text-[#6B6B6B] hidden md:table-cell">{formatDateShort(article.updated_at)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-center">
                        <button
                          onClick={() => toggleFeatured(article)}
                          title={isFeatured ? 'Remove from featured' : 'Mark as featured'}
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-colors ${isFeatured ? 'bg-[#E8A020] text-white' : 'bg-[#E5E5E0] text-[#9B9B9B] hover:bg-[#E8A020] hover:text-white'}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/articles/${article.id}`} className="text-[#E8A020] hover:text-[#C8851A] font-medium text-xs">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
