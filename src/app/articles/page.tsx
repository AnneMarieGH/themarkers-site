import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPublishedArticles, getCategories } from '@/lib/db'
import type { Article, Category } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { CategoryTag } from '@/components/content/CategoryTag'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'All Stories',
  description: 'Profiles, perspectives, and stories celebrating Asian Australian excellence.',
}

// ── No-image text tile ────────────────────────────────────────────────────────

function TextCover({ article, aspectClass }: { article: Article; aspectClass: string }) {
  return (
    <div className={`relative ${aspectClass} bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-white text-center`}>
      {article.category && (
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/60 mb-3">
          {article.category.title}
        </span>
      )}
      <p className="font-playfair font-bold text-xl leading-snug line-clamp-3">{article.title}</p>
    </div>
  )
}

// ── Large card (2/3 width) ────────────────────────────────────────────────────

function LargeCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      {article.cover_image ? (
        <div className="relative aspect-video overflow-hidden rounded-sm mb-4">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </div>
      ) : (
        <div className="mb-4 rounded-sm overflow-hidden">
          <TextCover article={article} aspectClass="aspect-video" />
        </div>
      )}
      {article.cover_image && article.category && (
        <div className="mb-3"><CategoryTag title={article.category.title} /></div>
      )}
      <h2 className="font-playfair font-bold text-2xl leading-snug mb-3 group-hover:underline decoration-[#E8A020] underline-offset-2">
        {article.title}
      </h2>
      {article.excerpt && (
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-[#9B9B9B]">
        {article.author_name && <span>{article.author_name}</span>}
        {article.author_name && article.published_at && <span>·</span>}
        {article.published_at && <span>{formatDate(article.published_at)}</span>}
      </div>
    </Link>
  )
}

// ── Small card (1/3 width) ────────────────────────────────────────────────────

function SmallCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      {article.cover_image ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="mb-4 rounded-sm overflow-hidden">
          <TextCover article={article} aspectClass="aspect-[4/3]" />
        </div>
      )}
      {article.cover_image && article.category && (
        <div className="mb-3"><CategoryTag title={article.category.title} /></div>
      )}
      <h3 className="font-playfair font-bold text-lg leading-snug line-clamp-2 mb-3 group-hover:underline decoration-[#E8A020] underline-offset-2">
        {article.title}
      </h3>
      {article.published_at && (
        <p className="text-xs text-[#9B9B9B]">{formatDate(article.published_at)}</p>
      )}
    </Link>
  )
}

// ── Equal card (1/2 width, Row B) ─────────────────────────────────────────────

function EqualCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      {article.cover_image ? (
        <div className="relative aspect-video overflow-hidden rounded-sm mb-4">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div className="mb-4 rounded-sm overflow-hidden">
          <TextCover article={article} aspectClass="aspect-video" />
        </div>
      )}
      {article.cover_image && article.category && (
        <div className="mb-3"><CategoryTag title={article.category.title} /></div>
      )}
      <h3 className="font-playfair font-bold text-xl leading-snug line-clamp-2 mb-3 group-hover:underline decoration-[#E8A020] underline-offset-2">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-[#9B9B9B]">
        {article.author_name && <span>{article.author_name}</span>}
        {article.author_name && article.published_at && <span>·</span>}
        {article.published_at && <span>{formatDate(article.published_at)}</span>}
      </div>
    </Link>
  )
}

// ── Row A: large-left + small-right (3-col grid, 2+1) ─────────────────────────

function RowA({ pair }: { pair: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="md:col-span-2">{pair[0] && <LargeCard article={pair[0]} />}</div>
      <div className="md:col-span-1">{pair[1] && <SmallCard article={pair[1]} />}</div>
    </div>
  )
}

// ── Row B: equal + equal (2-col grid, 1+1) ────────────────────────────────────

function RowB({ pair }: { pair: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div>{pair[0] && <EqualCard article={pair[0]} />}</div>
      <div>{pair[1] && <EqualCard article={pair[1]} />}</div>
    </div>
  )
}

// ── Row C: small-left + large-right (3-col grid, 1+2) ─────────────────────────

function RowC({ pair }: { pair: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="md:col-span-1">{pair[0] && <SmallCard article={pair[0]} />}</div>
      <div className="md:col-span-2">{pair[1] && <LargeCard article={pair[1]} />}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const [allArticles, categories]: [Article[], Category[]] = await Promise.all([
    getPublishedArticles(),
    getCategories(),
  ])

  const articles = category
    ? allArticles.filter((a) => a.category?.slug === category)
    : allArticles

  // Group articles into pairs, each pair becomes one row
  const pairs: Article[][] = []
  for (let i = 0; i < articles.length; i += 2) {
    pairs.push(articles.slice(i, i + 2))
  }

  // Cycle: A B C B  A B C B …
  const rowTypes = ['A', 'B', 'C', 'B'] as const

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-16 pt-10 md:pt-16 pb-16 md:pb-24">

      {/* ── Page header ── */}
      <div className="pb-8 md:pb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Stories</h1>
        <p className="text-[#6B6B6B] mt-3 text-sm md:text-base">
          Profiles, perspectives, and stories celebrating Asian Australian excellence.
        </p>
      </div>

      {/* ── Category filter pills ── */}
      {categories.length > 0 && (
        <div className="relative">
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAFAF8] to-transparent pointer-events-none z-10" />
          <div className="flex gap-2 flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible pb-1 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/articles"
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                !category
                  ? 'bg-[#E8A020] text-white border border-[#E8A020]'
                  : 'border border-[#C5C5C0] text-[#1A1A1A] hover:border-[#E8A020] hover:text-[#1A1A1A] bg-transparent'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                  category === cat.slug
                    ? 'bg-[#E8A020] text-white border border-[#E8A020]'
                    : 'border border-[#C5C5C0] text-[#1A1A1A] hover:border-[#E8A020] hover:text-[#1A1A1A] bg-transparent'
                }`}
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HR separator beneath pills ── */}
      <div className="mt-6 mb-10">
        <hr className="border-t border-[#E5E5E0]" />
      </div>

      {/* ── Asymmetric article grid ── */}
      {articles.length > 0 ? (
        <div className="space-y-6 md:space-y-8">
          {pairs.map((pair, pairIndex) => {
            const rowType = rowTypes[pairIndex % 4]
            if (rowType === 'A') return <RowA key={pairIndex} pair={pair} />
            if (rowType === 'C') return <RowC key={pairIndex} pair={pair} />
            return <RowB key={pairIndex} pair={pair} />
          })}
        </div>
      ) : (
        <div className="py-24 text-center text-[#6B6B6B]">
          <p className="font-playfair text-2xl mb-2">Coming soon</p>
          <p className="text-sm">Our editors are working on great stories. Check back soon.</p>
        </div>
      )}
    </div>
  )
}
