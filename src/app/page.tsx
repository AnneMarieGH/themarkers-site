import { getPublishedArticles, getFeaturedArticles } from '@/lib/db'
import type { Article } from '@/lib/types'
import { ArticleCard } from '@/components/content/ArticleCard'
import { NewsletterSignup } from '@/components/content/NewsletterSignup'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { CategoryTag } from '@/components/content/CategoryTag'

export const revalidate = 60

export default async function HomePage() {
  const [featured, all]: [Article[], Article[]] = await Promise.all([
    getFeaturedArticles(),
    getPublishedArticles(),
  ])

  const pool = featured.length >= 4 ? featured : [
    ...featured,
    ...all.filter((a) => !featured.find((f) => f.id === a.id)),
  ]

  const hero = pool[0]
  const leftBig = pool[1]
  const rightTop = pool[2]
  const rightBottom = pool[3]
  const usedIds = new Set([hero?.id, leftBig?.id, rightTop?.id, rightBottom?.id])
  const grid = all.filter((a) => !usedIds.has(a.id)).slice(0, 12)

  return (
    <>
      {/* ── Hero ── full-width, 60vh image, headline overlaid */}
      {hero && (
        <section className="relative w-full h-[55vw] md:h-[60vh] md:min-h-[420px]">
          {hero.cover_image && (
            <Image
              src={hero.cover_image}
              alt={hero.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-16 pb-10 max-w-5xl">
            {hero.category && (
              <div className="mb-3"><CategoryTag title={hero.category.title} /></div>
            )}
            <Link href={`/articles/${hero.slug}`}>
              <h1 className="font-playfair font-bold text-white text-[1.625rem] sm:text-5xl lg:text-6xl leading-tight hover:text-[#E8A020] transition-colors mb-4 max-w-3xl">
                {hero.title}
              </h1>
            </Link>
            {hero.excerpt && (
              <p className="text-white/75 text-base leading-relaxed max-w-2xl line-clamp-2 mb-4 hidden sm:block">
                {hero.excerpt}
              </p>
            )}
            <div className="flex items-center gap-2 text-white/60 text-xs">
              {hero.author_name && <span>{hero.author_name}</span>}
              {hero.published_at && <><span>·</span><span>{formatDate(hero.published_at)}</span></>}
            </div>
          </div>
        </section>
      )}

      {/* ── Asymmetric 2+1 featured grid ── */}
      {(leftBig || rightTop || rightBottom) && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-16 mt-10 md:mt-16 lg:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridAutoRows: 'auto' }}>
            {leftBig && (
              <article className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-sm">
                {leftBig.cover_image && (
                  <div className="relative w-full h-full" style={{ minHeight: '480px' }}>
                    <Image
                      src={leftBig.cover_image}
                      alt={leftBig.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  {leftBig.category && (
                    <div className="mb-3"><CategoryTag title={leftBig.category.title} /></div>
                  )}
                  <Link href={`/articles/${leftBig.slug}`}>
                    <h2 className="font-playfair font-bold text-2xl sm:text-3xl leading-snug hover:text-[#E8A020] transition-colors mb-3">
                      {leftBig.title}
                    </h2>
                  </Link>
                  {leftBig.excerpt && (
                    <p className="text-white/75 text-sm line-clamp-2 mb-4">{leftBig.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    {leftBig.author_name && <span>{leftBig.author_name}</span>}
                    {leftBig.published_at && <><span>·</span><span>{formatDate(leftBig.published_at)}</span></>}
                  </div>
                </div>
              </article>
            )}

            {[rightTop, rightBottom].filter(Boolean).map((article) => article && (
              <article key={article.id} className="group flex flex-col overflow-hidden rounded-sm">
                {article.cover_image && (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="pt-4 flex-1">
                  {article.category && (
                    <CategoryTag title={article.category.title} />
                  )}
                  <Link href={`/articles/${article.slug}`}>
                    <h3 className="font-playfair font-bold text-lg leading-snug mt-4 group-hover:text-[#E8A020] transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-[#6B6B6B] mt-3 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 mt-4 text-xs text-[#6B6B6B]">
                    {article.author_name && <span>{article.author_name}</span>}
                    {article.published_at && <><span>·</span><span>{formatDate(article.published_at)}</span></>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Section divider ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-16 mt-10 md:mt-16 lg:mt-24">
        <hr className="border-t border-[#E5E5E0]" />
      </div>

      {/* ── Latest Stories ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-16 mt-10 md:mt-16 lg:mt-24">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Latest Stories</h2>
          <Link href="/articles" className="text-sm text-[#E8A020] hover:text-[#C8851A] font-medium transition-colors">
            View all →
          </Link>
        </div>

        {grid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {grid.map((article) => (
              <div
                key={article.id}
                className="border-l-2 border-transparent hover:border-[#E8A020] pl-4 transition-colors duration-200"
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#6B6B6B]">
            <p className="text-lg font-playfair mb-2">Stories coming soon.</p>
            <p className="text-sm">Subscribe below to be the first to read.</p>
          </div>
        )}
      </section>

      {/* ── Newsletter — clearly separated ── */}
      <div id="newsletter" className="mt-10 md:mt-16 lg:mt-24">
        <NewsletterSignup />
      </div>
    </>
  )
}
