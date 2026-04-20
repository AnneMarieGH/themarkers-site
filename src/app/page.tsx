import { client } from '@/lib/sanity'
import { articlesQuery, featuredArticlesQuery } from '@/lib/queries'
import type { Article } from '@/lib/types'
import { ArticleCard } from '@/components/content/ArticleCard'
import { NewsletterSignup } from '@/components/content/NewsletterSignup'
import Link from 'next/link'

export const revalidate = 60

async function getFeaturedArticles(): Promise<Article[]> {
  try {
    return await client.fetch(featuredArticlesQuery)
  } catch {
    return []
  }
}

async function getLatestArticles(): Promise<Article[]> {
  try {
    return await client.fetch(articlesQuery)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, latest] = await Promise.all([getFeaturedArticles(), getLatestArticles()])
  const hero = featured[0] ?? latest[0]
  const secondaryFeatured = featured.slice(1, 3)
  const grid = latest.filter((a) => a._id !== hero?._id).slice(0, 9)

  return (
    <>
      {/* Hero section */}
      {hero && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <ArticleCard article={hero} variant="featured" />
        </section>
      )}

      {/* Secondary featured row */}
      {secondaryFeatured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#E5E5E0]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryFeatured.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Latest articles grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#E5E5E0]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B]">Latest Stories</h2>
          <Link href="/articles" className="text-sm text-[#C9A96E] hover:text-[#A8853A] font-medium transition-colors">
            View all →
          </Link>
        </div>

        {grid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {grid.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#6B6B6B]">
            <p className="text-lg font-serif mb-2">Stories coming soon.</p>
            <p className="text-sm">Subscribe below to be the first to read.</p>
          </div>
        )}
      </section>

      {/* Newsletter capture */}
      <div id="newsletter">
        <NewsletterSignup />
      </div>
    </>
  )
}
