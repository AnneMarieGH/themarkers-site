'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { Category } from '@/lib/types'

interface HeaderProps {
  navCategories?: Category[]
}

export function Header({ navCategories = [] }: HeaderProps) {
  const nav = [
    { label: 'Stories', href: '/articles' },
    ...navCategories.map((c) => ({ label: c.title, href: `/articles?category=${c.slug}` })),
  ]
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const pathname = usePathname()

  const isHomePage = pathname === '/'
  const isArticlePage = !!pathname?.match(/^\/articles\/.+/)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (isArticlePage) {
        const total = document.documentElement.scrollHeight - window.innerHeight
        setReadingProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isArticlePage])

  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const transparent = isHomePage && !scrolled

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          transparent
            ? 'bg-transparent border-transparent'
            : 'bg-white/80 backdrop-blur-md border-b border-[#E5E5E0]'
        }`}
      >
        {/* Reading progress bar */}
        {isArticlePage && (
          <div
            className="absolute top-0 left-0 h-[2px] bg-[#E8A020] transition-all duration-75 pointer-events-none"
            style={{ width: `${readingProgress}%` }}
          />
        )}

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-16">

          {/* ── Desktop: stacked two-row masthead ── */}
          <div className="hidden md:flex flex-col items-center pt-5 pb-4 gap-3">
            {/* Row 1: logo centered */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-black.png"
                alt="The Markers"
                width={184}
                height={75}
                priority
                className="transition-opacity duration-300"
              />
            </Link>

            {/* Row 2: nav centered */}
            <nav className="flex items-center gap-7">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors hover:text-[#E8A020] text-[#6B6B6B]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Mobile: logo centered, hamburger right ── */}
          <div className="flex md:hidden items-center h-20">
            {/* Spacer balances the hamburger so logo is truly centered */}
            <div className="w-9" />
            <Link href="/" className="flex-1 flex items-center justify-center">
              <Image
                src="/logo-black.png"
                alt="The Markers"
                width={150}
                height={61}
                priority
                className="transition-opacity duration-300"
              />
            </Link>
            <button
              className="w-9 p-1 transition-colors text-[#1A1A1A]"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Full-screen mobile overlay — slides in from the right */}
      <div
        className={`fixed inset-0 bg-[#1A1A1A] z-[100] flex flex-col px-8 py-10 transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between mb-12">
          <Image src="/logo-black.png" alt="The Markers" width={120} height={49} className="brightness-0 invert" />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="text-white/60 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-8 flex-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-playfair text-[2rem] font-bold text-white hover:text-[#E8A020] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

      </div>
    </>
  )
}
