export interface Category {
  id: number
  title: string
  slug: string
  description?: string | null
  color?: string | null
  show_in_nav?: boolean | null
  sort_order?: number | null
  created_at?: string
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  cover_image?: string | null
  video_url?: string | null
  category_id?: number | null
  category?: Category | null
  author_name?: string | null
  status: 'draft' | 'pending_review' | 'published'
  is_featured: boolean
  is_premium: boolean
  published_at?: string | null
  created_at: string
  updated_at: string
  article_type?: 'standard' | 'video' | 'sponsored' | null
  meta_title?: string | null
  meta_description?: string | null
  og_image?: string | null
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
  created_at: string
}
