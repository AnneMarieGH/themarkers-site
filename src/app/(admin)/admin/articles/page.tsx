import type { Metadata } from 'next'
import Link from 'next/link'
import { adminGetAllArticles } from '@/lib/db'
import { formatDateShort } from '@/lib/utils'

export const metadata: Metadata = { title: 'Articles | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const articles = await adminGetAllArticles()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-[#C9A96E] text-white text-sm font-semibold rounded-sm hover:bg-[#A8853A] transition-colors"
        >
          + New article
        </Link>
      </div>

      <div className="bg-white rounded-sm border border-[#E5E5E0] overflow-hidden">
        {articles.length === 0 ? (
          <div className="p-12 text-center text-[#6B6B6B]">
            <p className="font-serif text-lg mb-2">No articles yet</p>
            <p className="text-sm">Create your first article to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[#E5E5E0] bg-[#F5F5F3]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider hidden md:table-cell">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{article.title}</p>
                    {article.author_name && <p className="text-xs text-[#6B6B6B] mt-0.5">{article.author_name}</p>}
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B] hidden sm:table-cell">{article.category?.title ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B] hidden md:table-cell">{formatDateShort(article.updated_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/articles/${article.id}`} className="text-[#C9A96E] hover:text-[#A8853A] font-medium text-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
