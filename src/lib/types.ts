export interface Category {
  id: number
  title: string
  slug: string
  description?: string | null
  color?: string | null
  created_at?: string
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  cover_image?: string | null
  category_id?: number | null
  category?: Category | null
  author_name?: string | null
  status: 'draft' | 'published'
  is_featured: boolean
  is_premium: boolean
  published_at?: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
  created_at: string
}
