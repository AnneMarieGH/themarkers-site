import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { VideoThumbnail } from './VideoThumbnail'
import { CategoryTag } from './CategoryTag'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
}

function isVideoArticle(article: Article) {
  return article.category?.slug === 'video' && !!article.video_url
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const imageUrl = article.cover_image ?? null
  const categoryTitle = article.category?.title ?? null
  const isVideo = isVideoArticle(article)

  if (variant === 'compact') {
    return (
      <article className="flex gap-4 group">
        {imageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm">
            {isVideo ? (
              <VideoThumbnail videoUrl={article.video_url!} fallbackImage={imageUrl} alt={article.title} />
            ) : (
              <Image src={imageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {categoryTitle && (
            <CategoryTag title={categoryTitle} />
          )}
          <Link href={`/articles/${article.slug}`}>
            <h3 className="text-sm font-semibold leading-snug mt-1 group-hover:text-[#E8A020] transition-colors line-clamp-2">{article.title}</h3>
          </Link>
          {article.published_at && (
            <p className="text-xs text-[#6B6B6B] mt-1">{formatDate(article.published_at)}</p>
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
            {isVideo ? (
              <VideoThumbnail videoUrl={article.video_url!} fallbackImage={imageUrl} alt={article.title} />
            ) : (
              <Image src={imageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}
        <div className={imageUrl ? 'absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white' : 'p-4 md:p-6'}>
          {categoryTitle && (
            <div className="mb-3"><CategoryTag title={categoryTitle} /></div>
          )}
          <Link href={`/articles/${article.slug}`}>
            <h2 className="font-playfair text-2xl sm:text-3xl leading-tight hover:text-[#E8A020] transition-colors">{article.title}</h2>
          </Link>
          {article.excerpt && (
            <p className="mt-3 text-sm opacity-90 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-4 text-xs opacity-75">
            {article.author_name && <span>{article.author_name}</span>}
            {article.published_at && <><span>·</span><span>{formatDate(article.published_at)}</span></>}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group">
      {/* Mobile: compact horizontal layout */}
      <div className="flex md:hidden gap-4">
        {imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-sm">
            {isVideo ? (
              <VideoThumbnail videoUrl={article.video_url!} fallbackImage={imageUrl} alt={article.title} />
            ) : (
              <Image src={imageUrl} alt={article.title} fill className="object-cover" />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {categoryTitle && <CategoryTag title={categoryTitle} />}
          <Link href={`/articles/${article.slug}`}>
            <h2 className="font-playfair text-base font-bold leading-snug mt-1 group-hover:text-[#E8A020] transition-colors line-clamp-3">{article.title}</h2>
          </Link>
          {article.published_at && (
            <p className="text-xs text-[#9B9B9B] mt-1">{formatDate(article.published_at)}</p>
          )}
        </div>
      </div>

      {/* Desktop: stacked card layout */}
      <div className="hidden md:flex flex-col">
        {imageUrl && (
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm mb-4">
            {isVideo ? (
              <VideoThumbnail videoUrl={article.video_url!} fallbackImage={imageUrl} alt={article.title} />
            ) : (
              <Image src={imageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            )}
          </div>
        )}
        <div className="flex-1">
          {categoryTitle && <CategoryTag title={categoryTitle} />}
          <Link href={`/articles/${article.slug}`}>
            <h2 className="font-playfair text-xl leading-snug mt-4 group-hover:text-[#E8A020] transition-colors">{article.title}</h2>
          </Link>
          {article.excerpt && (
            <p className="text-sm text-[#6B6B6B] mt-3 line-clamp-3">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-4 text-xs text-[#6B6B6B]">
            {article.author_name && <span>{article.author_name}</span>}
            {article.published_at && <><span>·</span><span>{formatDate(article.published_at)}</span></>}
          </div>
        </div>
      </div>
    </article>
  )
}
