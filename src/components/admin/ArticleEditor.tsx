'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Article, Category } from '@/lib/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface ArticleEditorProps {
  article?: Article
  categories: Category[]
}

export function ArticleEditor({ article, categories }: ArticleEditorProps) {
  const router = useRouter()
  const isEdit = !!article

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [coverImage, setCoverImage] = useState(article?.cover_image ?? '')
  const [categoryId, setCategoryId] = useState<number | ''>(article?.category_id ?? '')
  const [authorName, setAuthorName] = useState(article?.author_name ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(article?.status ?? 'draft')
  const [isFeatured, setIsFeatured] = useState(article?.is_featured ?? false)
  const [isPremium, setIsPremium] = useState(article?.is_premium ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) setSlug(autoSlug(value))
  }

  async function handleSave(publish?: boolean) {
    setSaving(true)
    setError('')
    const body = {
      title, slug, excerpt, content, cover_image: coverImage,
      category_id: categoryId === '' ? null : categoryId,
      author_name: authorName,
      status: publish ? 'published' : status,
      is_featured: isFeatured,
      is_premium: isPremium,
    }
    const url = isEdit ? `/api/admin/articles/${article!.id}` : '/api/admin/articles'
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      router.push('/admin/articles')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Save failed. Please try again.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this article permanently?')) return
    const res = await fetch(`/api/admin/articles/${article!.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/articles')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E5E5E0] rounded-sm focus:outline-none focus:border-[#C9A96E] bg-white text-base font-semibold"
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-[#E5E5E0] rounded-sm focus:outline-none focus:border-[#C9A96E] bg-white text-sm resize-none"
              placeholder="A short summary shown in listings…"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Body</label>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? '')}
                height={500}
                preview="edit"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E0] rounded-sm p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Publish</h3>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#C9A96E] bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="flex-1 py-2 border border-[#E5E5E0] text-sm font-semibold rounded-sm hover:bg-[#F5F5F3] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 py-2 bg-[#C9A96E] text-white text-sm font-semibold rounded-sm hover:bg-[#A8853A] transition-colors disabled:opacity-60"
              >
                Publish
              </button>
            </div>

            {isEdit && (
              <button
                onClick={handleDelete}
                className="w-full py-2 text-red-500 text-sm hover:text-red-700 transition-colors"
              >
                Delete article
              </button>
            )}
          </div>

          <div className="bg-white border border-[#E5E5E0] rounded-sm p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Details</h3>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Slug (URL)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#C9A96E] bg-white font-mono"
                placeholder="article-slug"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Author</label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#C9A96E] bg-white"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#C9A96E] bg-white"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Cover image URL</label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#C9A96E] bg-white"
                placeholder="https://…"
              />
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="Cover preview" className="mt-2 rounded-sm w-full object-cover aspect-video" />
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E5E0]">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
                Featured story
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="rounded" />
                Members only
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
