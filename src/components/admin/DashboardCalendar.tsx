'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CalendarArticle {
  id: number
  title: string
  slug: string
  published_at: string | null | undefined
}

interface Props {
  articles: CalendarArticle[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function DashboardCalendar({ articles }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  // Group articles by day-of-month
  const byDay: Record<number, CalendarArticle[]> = {}
  for (const a of articles) {
    if (!a.published_at) continue
    const d = new Date(a.published_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(a)
    }
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-white border border-[#E5E5E0] rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#1A1A1A]">Content Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-[#F5F5F3] rounded transition-colors">
            <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-[#1A1A1A] w-32 text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-[#F5F5F3] rounded transition-colors">
            <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#E5E5E0] border border-[#E5E5E0] rounded-sm overflow-hidden text-xs">
        {DAYS.map(d => (
          <div key={d} className="bg-[#F5F5F3] text-[#6B6B6B] font-semibold text-center py-2">{d}</div>
        ))}
        {cells.map((day, i) => {
          const isToday = day !== null && day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dayArticles = day ? (byDay[day] ?? []) : []
          return (
            <div key={i} className={`bg-white min-h-[60px] p-1.5 ${day === null ? 'bg-[#FAFAF8]' : ''}`}>
              {day !== null && (
                <>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${isToday ? 'bg-[#E8A020] text-white' : 'text-[#6B6B6B]'}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayArticles.slice(0, 2).map(a => (
                      <Link
                        key={a.id}
                        href={`/admin/articles/${a.id}`}
                        className="block truncate text-[0.65rem] leading-tight text-[#E8A020] hover:underline"
                        title={a.title}
                      >
                        {a.title}
                      </Link>
                    ))}
                    {dayArticles.length > 2 && (
                      <span className="text-[0.65rem] text-[#9B9B9B]">+{dayArticles.length - 2} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
