import type { Metadata } from 'next'
import Link from 'next/link'
import { adminGetDashboardData } from '@/lib/db'
import { DashboardCalendar } from '@/components/admin/DashboardCalendar'
import { formatDateShort } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { stats, actionQueue, calendarArticles } = await adminGetDashboardData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Editorial overview</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors"
        >
          + New article
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Published this week', value: stats.publishedThisWeek },
          { label: 'Published this month', value: stats.publishedThisMonth },
          { label: 'Total published', value: stats.totalPublished },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E5E5E0] rounded-sm p-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">{stat.label}</p>
            <p className="text-4xl font-bold text-[#1A1A1A] mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action queue */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E5E5E0] rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E0] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Needs Attention</h2>
              <Link href="/admin/articles?status=draft" className="text-xs text-[#E8A020] hover:text-[#C8851A]">
                View all →
              </Link>
            </div>
            {actionQueue.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#6B6B6B]">
                <p>No drafts or articles in review.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E5E0]">
                {actionQueue.map((article) => (
                  <li key={article.id} className="px-5 py-3 hover:bg-[#F5F5F3] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${
                            article.status === 'pending_review' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {article.status === 'pending_review' ? 'In Review' : 'Draft'}
                          </span>
                          <span className="text-xs text-[#9B9B9B]">{formatDateShort(article.updated_at)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-xs text-[#E8A020] hover:text-[#C8851A] font-medium flex-shrink-0 mt-0.5"
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Content calendar */}
        <div className="lg:col-span-2">
          <DashboardCalendar articles={calendarArticles} />
        </div>
      </div>
    </div>
  )
}
