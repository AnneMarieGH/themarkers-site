import Link from 'next/link'
import Image from 'next/image'
import { type Article } from '@/lib/types'
import { urlFor } from '@/lib/sanity'
import { formatDate } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(variant === 'featured' ? 1200 : 800).height(variant === 'featured' ? 630 : 500).auto('format').url()
    : null

  if (variant === 'compact') {
    return (
      <article className="flex gap-4 group">
        {imageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm">
            <Image src={imageUrl} alt={article.mainImage?.alt ?? article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.categories?.[0] && (
            <span className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider">{article.categories[0].title}</span>
          )}
          <Link href={`/articles/${article.slug}`}>
            <h3 className="text-sm font-semibold leading-snug mt-1 group-hover:text-[#C9A96E] transition-colors line-clamp-2">{article.title}</h3>
          </Link>
          {article.publishedAt && (
            <p className="text-xs text-[#6B6B6B] mt-1">{formatDate(article.publishedAt)}</p>
          )}
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className="group relative overflow-hidden rounded-sm">
        {imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image src={imageUrl} alt={article.mainImage?.alt ?? article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}
        <div className={imageUrl ? 'absolute bottom-0 left-0 right-0 p-6 text-white' : 'p-6'}>
          {article.categories?.[0] && (
            <span className="inline-block text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-2">{article.categories[0].title}</span>
          )}
          <Link href={`/articles/${article.slug}`}>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight hover:text-[#C9A96E] transition-colors">{article.title}</h2>
          </Link>
          {article.excerpt && (
            <p className="mt-2 text-sm opacity-90 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs opacity-75">
            {article.author && <span>{article.author.name}</span>}
            {article.publishedAt && <><span>·</span><span>{formatDate(article.publishedAt)}</span></>}
            {article.readingTime && <><span>·</span><span>{article.readingTime} min read</span></>}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex flex-col">
      {imageUrl && (
        <div className="relative aspect-[3/2] overflow-hidden rounded-sm mb-4">
          <Image src={imageUrl} alt={article.mainImage?.alt ?? article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="flex-1">
        {article.categories?.[0] && (
          <span className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider">{article.categories[0].title}</span>
        )}
        <Link href={`/articles/${article.slug}`}>
          <h2 className="font-serif text-xl font-bold leading-snug mt-1 group-hover:text-[#C9A96E] transition-colors">{article.title}</h2>
        </Link>
        {article.excerpt && (
          <p className="text-sm text-[#6B6B6B] mt-2 line-clamp-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-[#6B6B6B]">
          {article.author && <span>{article.author.name}</span>}
          {article.publishedAt && <><span>·</span><span>{formatDate(article.publishedAt)}</span></>}
          {article.readingTime && <><span>·</span><span>{article.readingTime} min read</span></>}
        </div>
      </div>
    </article>
  )
}
