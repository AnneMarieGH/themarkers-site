import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { articleBySlugQuery, articlesQuery } from '@/lib/queries'
import type { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { NewsletterSignup } from '@/components/content/NewsletterSignup'
import { PremiumGate } from '@/components/content/PremiumGate'
import { checkMembership } from '@/lib/membership'

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article: Article | null = await client.fetch(articleBySlugQuery, { slug }).catch(() => null)

  if (!article) return {}

  const imageUrl = article.mainImage ? urlFor(article.mainImage).width(1200).height(630).url() : undefined

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author.name] : undefined,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const articles: Article[] = await client.fetch(articlesQuery).catch(() => [])
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, isMember]: [Article | null, boolean] = await Promise.all([
    client.fetch(articleBySlugQuery, { slug }).catch(() => null),
    checkMembership(),
  ])

  if (!article) notFound()

  const showGate = article.isPremium && !isMember

  const heroImageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1200).height(630).auto('format').url()
    : null

  return (
    <>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#6B6B6B] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[#1A1A1A] transition-colors">Stories</Link>
          {article.categories?.[0] && (
            <>
              <span>/</span>
              <span>{article.categories[0].title}</span>
            </>
          )}
        </nav>

        {/* Category */}
        {article.categories?.[0] && (
          <div className="mb-3">
            <span className="text-[#C9A96E] text-xs font-semibold uppercase tracking-widest">{article.categories[0].title}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[#6B6B6B] text-lg leading-relaxed mb-6 font-serif italic">{article.excerpt}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-[#6B6B6B] pb-6 border-b border-[#E5E5E0] mb-8">
          {article.author && (
            <span className="font-medium text-[#1A1A1A]">{article.author.name}</span>
          )}
          {article.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </>
          )}
          {article.readingTime && (
            <>
              <span>·</span>
              <span>{article.readingTime} min read</span>
            </>
          )}
        </div>

        {/* Hero image */}
        {heroImageUrl && (
          <figure className="mb-8 -mx-4 sm:mx-0">
            <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
              <Image
                src={heroImageUrl}
                alt={article.mainImage?.alt ?? article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {article.mainImage?.alt && (
              <figcaption className="text-xs text-[#6B6B6B] text-center mt-2 px-4">{article.mainImage.alt}</figcaption>
            )}
          </figure>
        )}

        {/* Premium badge */}
        {article.isPremium && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C9A96E] border border-[#C9A96E] rounded-sm px-2 py-0.5 uppercase tracking-widest">
              ✦ Members Only
            </span>
          </div>
        )}

        {/* Body */}
        {article.body && !showGate && (
          <div className="prose-editorial">
            <PortableTextRenderer value={article.body} />
          </div>
        )}
        {article.body && showGate && (
          <>
            <div className="prose-editorial">
              <PortableTextRenderer value={article.body.slice(0, 2)} />
            </div>
            <PremiumGate />
          </>
        )}

        {/* Author bio */}
        {article.author && (
          <div className="mt-12 pt-8 border-t border-[#E5E5E0] flex items-start gap-4">
            {article.author.image && (
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={urlFor(article.author.image).width(112).height(112).url()}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{article.author.name}</p>
              <p className="text-xs text-[#6B6B6B] mt-1">Contributor, The Ethnic Australia</p>
            </div>
          </div>
        )}
      </article>

      <div id="newsletter">
        <NewsletterSignup />
      </div>
    </>
  )
}
