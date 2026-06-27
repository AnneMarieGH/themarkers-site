import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'
import type { Article, Category } from './types'
import { seedArticles, seedCategories } from './seed-data'

const isSeeded = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function getPublishedArticles(): Promise<Article[]> {
  if (isSeeded) return seedArticles.filter(a => a.status === 'published')
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug, color)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) {
    console.error('[db] getPublishedArticles:', error.message, '— falling back to seed data')
    return seedArticles.filter(a => a.status === 'published')
  }
  if (!data || data.length === 0) return seedArticles.filter(a => a.status === 'published')
  return data
}

export async function getFeaturedArticles(): Promise<Article[]> {
  if (isSeeded) return seedArticles.filter(a => a.is_featured && a.status === 'published').slice(0, 3)
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug, color)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3)
  if (error) {
    console.error('[db] getFeaturedArticles:', error.message, '— falling back to seed data')
    return seedArticles.filter(a => a.is_featured && a.status === 'published').slice(0, 3)
  }
  if (!data || data.length === 0) return seedArticles.filter(a => a.is_featured && a.status === 'published').slice(0, 3)
  return data
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isSeeded) return seedArticles.find(a => a.slug === slug && a.status === 'published') ?? null
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug, color)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) return seedArticles.find(a => a.slug === slug && a.status === 'published') ?? null
  return data
}

export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  if (isSeeded) {
    const cat = seedCategories.find(c => c.slug === categorySlug)
    if (!cat) return []
    return seedArticles.filter(a => a.status === 'published' && a.category_id === cat.id)
  }
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
  if (!cat) return []
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug, color)')
    .eq('status', 'published')
    .eq('category_id', cat.id)
    .order('published_at', { ascending: false })
  if (error) {
    const seedCat = seedCategories.find(c => c.slug === categorySlug)
    return seedCat ? seedArticles.filter(a => a.status === 'published' && a.category_id === seedCat.id) : []
  }
  return data ?? []
}

function sortCategories(cats: Category[]): Category[] {
  return cats.sort((a, b) => {
    const ao = a.sort_order ?? 9999
    const bo = b.sort_order ?? 9999
    if (ao !== bo) return ao - bo
    return a.title.localeCompare(b.title)
  })
}

export async function getCategories(): Promise<Category[]> {
  if (isSeeded) return seedCategories
  const { data, error } = await supabase.from('categories').select('*')
  if (error) { console.error('[db] getCategories:', error.message, '— falling back to seed data'); return seedCategories }
  return sortCategories(data ?? [])
}

export async function getNavCategories(): Promise<Category[]> {
  if (isSeeded) return seedCategories
  const { data, error } = await supabase.from('categories').select('*')
  if (error) { console.error('[db] getNavCategories:', error.message, '— falling back to seed data'); return seedCategories }
  const navCats = (data ?? []).filter((c) => c.show_in_nav !== false)
  return sortCategories(navCats)
}

// Admin queries — server-side only, use service role key via route handlers

export async function adminGetAllArticles(): Promise<Article[]> {
  if (isSeeded) return [...seedArticles].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*, category:categories(id, title, slug)')
    .order('created_at', { ascending: false })
  if (error) { console.error('[db] adminGetAllArticles:', error.message); return [] }
  return data ?? []
}

export async function adminGetDashboardData() {
  const articles = await adminGetAllArticles()
  const now = new Date()
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7); startOfWeek.setHours(0,0,0,0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const published = articles.filter(a => a.status === 'published')
  const publishedThisWeek = published.filter(a => a.published_at && new Date(a.published_at) >= startOfWeek)
  const publishedThisMonth = published.filter(a => a.published_at && new Date(a.published_at) >= startOfMonth)
  const actionQueue = articles.filter(a => a.status === 'draft' || a.status === 'pending_review')
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 10)

  return {
    stats: {
      totalPublished: published.length,
      publishedThisWeek: publishedThisWeek.length,
      publishedThisMonth: publishedThisMonth.length,
    },
    actionQueue,
    calendarArticles: published.map(a => ({ id: a.id, title: a.title, slug: a.slug, published_at: a.published_at })),
  }
}

export async function adminGetArticleById(id: number): Promise<Article | null> {
  if (isSeeded) return seedArticles.find(a => a.id === id) ?? null
  const { data } = await supabaseAdmin
    .from('articles')
    .select('*, category:categories(id, title, slug)')
    .eq('id', id)
    .single()
  return data ?? null
}
