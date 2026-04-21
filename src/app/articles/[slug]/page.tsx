import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArticleBySlug, getPublishedArticles } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { NewsletterSignup } from '@/components/content/NewsletterSignup'
import { PremiumGate } from '@/components/content/PremiumGate'
import { checkMembership } from '@/lib/membership'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      images: article.cover_image ? [{ url: article.cover_image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image ? [article.cover_image] : undefined,
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
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
            <span className="text-[#C9A96E] text-xs font-semibold uppercase tracking-widest">{article.category.title}</span>
          </div>
        )}

        <h1 className="font-anton font-normal text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">{article.title}</h1>

        {article.excerpt && (
          <p className="text-[#6B6B6B] text-lg leading-relaxed mb-6 font-serif italic">{article.excerpt}</p>
        )}

        <div className="flex items-center gap-3 text-sm text-[#6B6B6B] pb-6 border-b border-[#E5E5E0] mb-8">
          {article.author_name && <span className="font-medium text-[#1A1A1A]">{article.author_name}</span>}
          {article.published_at && (
            <><span>·</span><time dateTime={article.published_at}>{formatDate(article.published_at)}</time></>
          )}
        </div>

        {article.cover_image && (
          <figure className="mb-8 -mx-4 sm:mx-0">
            <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
              <Image src={article.cover_image} alt={article.title} fill className="object-cover" priority unoptimized />
            </div>
          </figure>
        )}

        {article.is_premium && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C9A96E] border border-[#C9A96E] rounded-sm px-2 py-0.5 uppercase tracking-widest">
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

      <div id="newsletter">
        <NewsletterSignup />
      </div>
    </>
  )
}
