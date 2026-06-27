import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getNavCategories } from '@/lib/db'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700', '900'], style: ['normal', 'italic'], variable: '--font-playfair' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://themarkers.com.au'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'The Markers — Celebrating Asian Australian Excellence',
    template: '%s | The Markers',
  },
  description:
    'A refined publication celebrating Asian Australian entrepreneurs, businesses, and individuals making a positive impact. Stories, profiles, and perspectives.',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: siteUrl,
    siteName: 'The Markers',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@themarkers_au',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navCategories = await getNavCategories().catch(() => [])
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1A1A]">
        <Header navCategories={navCategories} />
        <main className="flex-1">{children}</main>
        <Footer navCategories={navCategories} />
      </body>
    </html>
  )
}
