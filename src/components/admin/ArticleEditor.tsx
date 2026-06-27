'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Article, Category } from '@/lib/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

import {
  bold, italic, strikethrough, hr, title1, title2, title3,
  link, image, quote, code, codeBlock,
  unorderedListCommand, orderedListCommand, checkedListCommand,
  table, divider, codeEdit, codeLive, codePreview, fullscreen,
} from '@uiw/react-md-editor/commands'

const editorCommands = [
  { ...bold,               buttonProps: { title: 'Bold (Ctrl+B)' } },
  { ...italic,             buttonProps: { title: 'Italic (Ctrl+I)' } },
  { ...strikethrough,      buttonProps: { title: 'Strikethrough' } },
  divider,
  { ...title1,             buttonProps: { title: 'Heading 1' } },
  { ...title2,             buttonProps: { title: 'Heading 2' } },
  { ...title3,             buttonProps: { title: 'Heading 3' } },
  divider,
  { ...link,               buttonProps: { title: 'Insert link' } },
  { ...image,              buttonProps: { title: 'Insert image URL' } },
  { ...quote,              buttonProps: { title: 'Blockquote' } },
  divider,
  { ...code,               buttonProps: { title: 'Inline code' } },
  { ...codeBlock,          buttonProps: { title: 'Code block' } },
  divider,
  { ...unorderedListCommand, buttonProps: { title: 'Bullet list' } },
  { ...orderedListCommand,   buttonProps: { title: 'Numbered list' } },
  { ...checkedListCommand,   buttonProps: { title: 'Task / checklist' } },
  divider,
  { ...hr,                 buttonProps: { title: 'Horizontal rule' } },
  { ...table,              buttonProps: { title: 'Insert table' } },
]

const editorExtraCommands = [
  { ...codeEdit,    buttonProps: { title: 'Edit mode' } },
  { ...codeLive,    buttonProps: { title: 'Split preview' } },
  { ...codePreview, buttonProps: { title: 'Preview mode' } },
  divider,
  { ...fullscreen,  buttonProps: { title: 'Toggle fullscreen' } },
]

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
  const [videoUrl, setVideoUrl] = useState(article?.video_url ?? '')
  const [categoryId, setCategoryId] = useState<number | ''>(article?.category_id ?? '')
  const [articleType, setArticleType] = useState<'standard' | 'video' | 'sponsored'>(article?.article_type ?? 'standard')

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const isVideoCategory = selectedCategory?.slug === 'video' || articleType === 'video'
  const [authorName, setAuthorName] = useState(article?.author_name ?? '')
  const [status, setStatus] = useState<'draft' | 'pending_review' | 'published'>(article?.status ?? 'draft')
  const [isFeatured, setIsFeatured] = useState(article?.is_featured ?? false)
  const [isPremium, setIsPremium] = useState(article?.is_premium ?? false)
  const [metaTitle, setMetaTitle] = useState(article?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(article?.meta_description ?? '')
  const [ogImage, setOgImage] = useState(article?.og_image ?? '')
  const [seoOpen, setSeoOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState('')
  const autoSaveRef = useRef(false)

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

  function buildBody(publish?: boolean) {
    return {
      title, slug, excerpt, content,
      cover_image: coverImage,
      video_url: videoUrl || null,
      category_id: categoryId === '' ? null : categoryId,
      author_name: authorName,
      status: publish ? 'published' : status,
      is_featured: isFeatured,
      is_premium: isPremium,
      article_type: articleType,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      og_image: ogImage || null,
    }
  }

  async function handleSave(publish?: boolean, silent?: boolean) {
    if (!silent) setSaving(true)
    setError('')
    const url = isEdit ? `/api/admin/articles/${article!.id}` : '/api/admin/articles'
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(publish)),
    })
    if (res.ok) {
      if (silent) {
        setLastSaved(new Date())
      } else {
        router.push('/admin/articles')
        router.refresh()
      }
    } else if (!silent) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Save failed. Please try again.')
    }
    if (!silent) setSaving(false)
  }

  // Auto-save every 30s for existing articles
  useEffect(() => {
    if (!isEdit) return
    const interval = setInterval(() => {
      if (!autoSaveRef.current) {
        autoSaveRef.current = true
        handleSave(false, true).finally(() => { autoSaveRef.current = false })
      }
    }, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, excerpt, content, coverImage, videoUrl, categoryId, authorName, status, isFeatured, isPremium, articleType, metaTitle, metaDescription, ogImage])

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
              className="w-full px-4 py-2.5 border border-[#E5E5E0] rounded-sm focus:outline-none focus:border-[#E8A020] bg-white text-base font-semibold"
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-[#E5E5E0] rounded-sm focus:outline-none focus:border-[#E8A020] bg-white text-sm resize-none"
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
                commands={editorCommands}
                extraCommands={editorExtraCommands}
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
                onChange={(e) => setStatus(e.target.value as 'draft' | 'pending_review' | 'published')}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
              >
                <option value="draft">Draft</option>
                <option value="pending_review">Submit for Review</option>
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
                className="flex-1 py-2 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60"
              >
                Publish
              </button>
            </div>

            {lastSaved && (
              <p className="text-xs text-[#9B9B9B] text-center">
                Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

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
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white font-mono"
                placeholder="article-slug"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Author</label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
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
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                placeholder="https://…"
              />
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="Cover preview" className="mt-2 rounded-sm w-full object-cover aspect-video" />
              )}
            </div>

            {isVideoCategory && (
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Video URL</label>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                  placeholder="https://…/video.mp4"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Article Type</label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as 'standard' | 'video' | 'sponsored')}
                className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
              >
                <option value="standard">Standard</option>
                <option value="video">Video</option>
                <option value="sponsored">Sponsored</option>
              </select>
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

          {/* SEO Panel */}
          <div className="bg-white border border-[#E5E5E0] rounded-sm overflow-hidden">
            <button
              onClick={() => setSeoOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] hover:bg-[#F5F5F3] transition-colors"
            >
              SEO & Sharing
              <svg className={`w-4 h-4 transition-transform ${seoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {seoOpen && (
              <div className="p-4 pt-0 space-y-4 border-t border-[#E5E5E0]">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Meta Title</label>
                  <input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                    placeholder="Defaults to article title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
                    Meta Description
                    <span className={`ml-2 font-normal ${metaDescription.length > 160 ? 'text-red-500' : 'text-[#9B9B9B]'}`}>
                      {metaDescription.length}/160
                    </span>
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white resize-none"
                    placeholder="Defaults to excerpt"
                  />
                </div>
                {/* Google preview */}
                <div className="bg-[#F5F5F3] rounded-sm p-3 text-xs">
                  <p className="text-[0.65rem] text-[#9B9B9B] uppercase tracking-wider mb-1">Google Preview</p>
                  <p className="text-[#1A0DAB] font-medium line-clamp-1 text-sm">{metaTitle || title || 'Article title'}</p>
                  <p className="text-[#006621] text-xs mt-0.5">themarkers.com.au/articles/{slug || 'article-slug'}</p>
                  <p className="text-[#545454] text-xs mt-0.5 line-clamp-2">{metaDescription || excerpt || 'No description set.'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">OG / Social Image URL</label>
                  <input
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                    placeholder="Defaults to cover image"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
