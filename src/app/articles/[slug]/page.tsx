import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArticleBySlug, getPublishedArticles } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { CategoryTag } from '@/components/content/CategoryTag'
import { NewsletterSignup } from '@/components/content/NewsletterSignup'
import { PremiumGate } from '@/components/content/PremiumGate'
import { VideoThumbnail } from '@/components/content/VideoThumbnail'
import { ShareStrip } from '@/components/content/ShareStrip'
import { checkMembership } from '@/lib/membership'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  const title = article.meta_title || article.title
  const description = article.meta_description || article.excerpt || undefined
  const ogImageUrl = article.og_image || article.cover_image || undefined
  const ogImage = ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, isMember] = await Promise.all([
    getArticleBySlug(slug),
    checkMembership(),
  ])

  if (!article) notFound()

  const showGate = article.is_premium && !isMember

  return (
    <>
      {/* Article header: wider column for title, byline, cover image */}
      <div className="max-w-[860px] mx-auto px-5 sm:px-6 lg:px-8 pt-10">
        <nav className="text-xs text-[#6B6B6B] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[#1A1A1A] transition-colors">Stories</Link>
          {article.category && (
            <>
              <span>/</span>
              <span>{article.category.title}</span>
            </>
          )}
        </nav>

        {article.category && (
          <div className="mb-3">
            <CategoryTag title={article.category.title} />
          </div>
        )}

        <h1 className="font-playfair font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">{article.title}</h1>

        {article.excerpt && (
          <p className="text-[#6B6B6B] text-lg leading-relaxed mb-6 font-serif italic">{article.excerpt}</p>
        )}

        <div className="flex items-center gap-3 pb-6 border-b border-[#E5E5E0] mb-8">
          {article.author_name && (
            <div className="w-9 h-9 rounded-full bg-[#E8A020] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
              {article.author_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
          )}
          <div className="flex flex-col leading-snug">
            {article.author_name && (
              <span className="text-sm font-semibold text-[#1A1A1A]">{article.author_name}</span>
            )}
            {article.published_at && (
              <time dateTime={article.published_at} className="text-xs text-[#9B9B9B]">
                {formatDate(article.published_at)}
              </time>
            )}
          </div>
        </div>

        {(article.cover_image || (article.category?.slug === 'video' && article.video_url)) && (
          <figure className="mb-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
              {article.category?.slug === 'video' && article.video_url ? (
                <VideoThumbnail videoUrl={article.video_url} fallbackImage={article.cover_image} alt={article.title} />
              ) : (
                <Image src={article.cover_image!} alt={article.title} fill className="object-cover" priority />
              )}
            </div>
          </figure>
        )}
      </div>

      {/* Article body: narrow 680px reading column */}
      <article className="max-w-[680px] mx-auto px-5 sm:px-6 pb-24 md:pb-16">
        {article.is_premium && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8A020] border border-[#E8A020] rounded-sm px-2 py-0.5 uppercase tracking-widest">
              ✦ Members Only
            </span>
          </div>
        )}

        {article.content && !showGate && (
          <div className="prose-editorial">
            <MarkdownRenderer content={article.content} />
          </div>
        )}

        {article.content && showGate && (
          <>
            <div className="prose-editorial">
              <MarkdownRenderer content={article.content.split('\n\n').slice(0, 3).join('\n\n')} />
            </div>
            <PremiumGate />
          </>
        )}
      </article>

      <ShareStrip title={article.title} />

      <div id="newsletter">
        <NewsletterSignup />
      </div>
    </>
  )
}
