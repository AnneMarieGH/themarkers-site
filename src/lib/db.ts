import { supabase } from './supabase'
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
  if (error) { console.error('[db] getPublishedArticles:', error.message); return [] }
  return data ?? []
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
  if (error) { console.error('[db] getFeaturedArticles:', error.message); return [] }
  return data ?? []
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isSeeded) return seedArticles.find(a => a.slug === slug && a.status === 'published') ?? null
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug, color)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) return null
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
  if (error) return []
  return data ?? []
}

export async function getCategories(): Promise<Category[]> {
  if (isSeeded) return seedCategories
  const { data, error } = await supabase.from('categories').select('*').order('title')
  if (error) return []
  return data ?? []
}

// Admin queries — server-side only, use service role key via route handlers

export async function adminGetAllArticles(): Promise<Article[]> {
  if (isSeeded) return [...seedArticles].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug)')
    .order('created_at', { ascending: false })
  if (error) { console.error('[db] adminGetAllArticles:', error.message); return [] }
  return data ?? []
}

export async function adminGetArticleById(id: number): Promise<Article | null> {
  if (isSeeded) return seedArticles.find(a => a.id === id) ?? null
  const { data } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug)')
    .eq('id', id)
    .single()
  return data ?? null
}
