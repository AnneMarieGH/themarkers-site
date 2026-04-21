import type { Metadata } from 'next'
import { getPublishedArticles, getCategories } from '@/lib/db'
import type { Article, Category } from '@/lib/types'
import { ArticleCard } from '@/components/content/ArticleCard'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'All Stories',
  description: 'Profiles, perspectives, and stories celebrating Asian Australian excellence.',
}

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-[#E5E5E0] pb-6 mb-8">
        <h1 className="font-serif text-4xl font-bold">Stories</h1>
        <p className="text-[#6B6B6B] mt-2 text-sm">Profiles, perspectives, and stories celebrating Asian Australian excellence.</p>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <Link
            href="/articles"
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-colors ${!category ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E5E5E0] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/articles?category=${cat.slug}`}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-colors ${category === cat.slug ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E5E5E0] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}
            >
              {cat.title}
            </Link>
          ))}
        </div>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-[#6B6B6B]">
          <p className="font-serif text-2xl mb-2">Coming soon</p>
          <p className="text-sm">Our editors are working on great stories. Check back soon.</p>
        </div>
      )}
    </div>
  )
}
