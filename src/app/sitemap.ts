import type { MetadataRoute } from 'next'
import { getPublishedArticles } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://themarkers.com.au'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles().catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/articles/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes]
}
