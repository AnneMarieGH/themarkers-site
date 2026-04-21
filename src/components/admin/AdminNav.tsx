'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminNavProps {
  role: 'admin' | 'editor'
}

const links = [
  { href: '/admin/articles', label: 'Articles', icon: '📝' },
  { href: '/admin/categories', label: 'Categories', icon: '🗂️' },
]

const adminLinks = [
  { href: '/admin/users', label: 'Users', icon: '👥' },
]

export function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  const allLinks = role === 'admin' ? [...links, ...adminLinks] : links

  return (
    <aside className="w-56 bg-[#1A1A1A] text-white flex flex-col shrink-0">
      <div className="p-5 border-b border-[#333]">
        <p className="font-serif font-bold text-sm">The Markers</p>
        <p className="text-[#999] text-xs mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {allLinks.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${active ? 'bg-[#C9A96E] text-white' : 'text-[#999] hover:text-white hover:bg-white/10'}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[#333]">
        <button
          onClick={handleSignOut}
          className="w-full px-3 py-2 text-sm text-[#999] hover:text-white text-left rounded-sm hover:bg-white/10 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
