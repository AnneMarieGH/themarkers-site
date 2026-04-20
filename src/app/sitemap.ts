import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { articlesQuery } from '@/lib/queries'
import type { Article } from '@/lib/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theethnicaustralia.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles: Article[] = await client.fetch(articlesQuery).catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/articles/${a.slug}`,
    lastModified: new Date(a.publishedAt ?? a._createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes]
}
