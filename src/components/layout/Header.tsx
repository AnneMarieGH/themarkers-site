'use client'

import Link from 'next/link'
import { useState } from 'react'

const nav = [
  { label: 'Stories', href: '/articles' },
  { label: 'Business', href: '/articles?category=business' },
  { label: 'Careers', href: '/articles?category=careers' },
  { label: 'Culture', href: '/articles?category=culture' },
  { label: 'People', href: '/articles?category=people' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-[#E5E5E0] bg-[#FAFAF8] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A]">
              The Markers
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#newsletter"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-[#C9A96E] text-white text-sm font-semibold rounded-sm hover:bg-[#A8853A] transition-colors"
            >
              Subscribe
            </Link>
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#E5E5E0] bg-[#FAFAF8] px-4 py-4 space-y-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-sm font-medium text-[#1A1A1A]"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#newsletter"
            className="inline-flex items-center px-4 py-2 bg-[#C9A96E] text-white text-sm font-semibold rounded-sm"
            onClick={() => setMenuOpen(false)}
          >
            Subscribe
          </Link>
        </div>
      )}
    </header>
  )
}
