'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/types'

function autoSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function sortedCats(cats: Category[]) {
  return [...cats].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
}

export function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const initialRef = useRef<Category[]>(sortedCats(initial))

  const [categories, setCategories] = useState<Category[]>(sortedCats(initial))
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const [editing, setEditing] = useState<number | null>(null)
  const [editFields, setEditFields] = useState<Partial<Category>>({})
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const dragIndex = useRef<number | null>(null)

  // Detect unsaved changes
  const isDirty =
    deletedIds.size > 0 ||
    categories.some((cat, i) => {
      const orig = initialRef.current.find((c) => c.id === cat.id)
      if (!orig) return false
      return (
        cat.title !== orig.title ||
        cat.slug !== orig.slug ||
        (cat.description ?? '') !== (orig.description ?? '') ||
        (cat.show_in_nav ?? true) !== (orig.show_in_nav ?? true) ||
        i !== initialRef.current.indexOf(orig)
      )
    })

  // ── local-only mutations ──────────────────────────────────────────────────

  function toggleNav(id: number) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, show_in_nav: !(c.show_in_nav ?? true) } : c))
    )
  }

  function markDelete(id: number) {
    if (editing === id) setEditing(null)
    setDeletedIds((prev) => new Set([...prev, id]))
  }

  function unmarkDelete(id: number) {
    setDeletedIds((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setEditFields({ title: cat.title, slug: cat.slug, description: cat.description ?? '' })
  }

  function applyEdit(id: number) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...editFields } : c)))
    setEditing(null)
  }

  // Drag-to-reorder (local only)
  function handleDragStart(i: number) { dragIndex.current = i }
  function handleDragEnter(i: number) {
    if (dragIndex.current === null || dragIndex.current === i) return
    setCategories((prev) => {
      const arr = [...prev]
      const [moved] = arr.splice(dragIndex.current!, 1)
      arr.splice(i, 0, moved)
      dragIndex.current = i
      return arr
    })
  }
  function handleDragEnd() { dragIndex.current = null }

  // ── Save all changes to DB ────────────────────────────────────────────────

  async function saveAll() {
    setSaving(true)
    setError('')
    try {
      // 1. Deletes
      const deleteResults = await Promise.all(
        [...deletedIds].map(async (id) => {
          const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            const json = await res.json().catch(() => ({}))
            return `Delete ${id}: ${json.error ?? res.status}`
          }
          return null
        })
      )

      // 2. Patches — send each field explicitly so show_in_nav:false is never coerced
      const surviving = categories.filter((c) => !deletedIds.has(c.id))
      const patchResults = await Promise.all(
        surviving.map(async (cat, idx) => {
          const res = await fetch(`/api/admin/categories/${cat.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: cat.title,
              slug: cat.slug,
              description: cat.description ?? null,
              show_in_nav: cat.show_in_nav === false ? false : (cat.show_in_nav ?? true),
              sort_order: idx,
            }),
          })
          if (!res.ok) {
            const json = await res.json().catch(() => ({}))
            return `Update "${cat.title}": ${json.error ?? res.status}`
          }
          return null
        })
      )

      const errs = [...deleteResults, ...patchResults].filter(Boolean)
      if (errs.length > 0) {
        setError(`Some changes failed: ${errs.join('; ')}`)
        setSaving(false)
        return
      }

      // 3. Commit local reference so isDirty resets to false
      initialRef.current = surviving.map((c, i) => ({ ...c, sort_order: i }))
      setCategories(initialRef.current)
      setDeletedIds(new Set())
      setEditing(null)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (e) {
      setError(`Unexpected error: ${e instanceof Error ? e.message : 'Please try again.'}`)
    }
    setSaving(false)
  }

  // ── Add new category (immediate — creates a DB record right away) ─────────

  async function handleAdd() {
    if (!newTitle.trim()) return
    setAdding(true)
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        slug: autoSlug(newTitle.trim()),
        sort_order: categories.length,
        show_in_nav: true,
      }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories((prev) => [...prev, cat])
      initialRef.current = [...initialRef.current, cat]
      setNewTitle('')
      router.refresh()
    } else {
      setError('Failed to create category.')
    }
    setAdding(false)
  }

  return (
    <div className="max-w-2xl space-y-4">

      {/* ── Category list ── */}
      <div className="bg-white border border-[#E5E5E0] rounded-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-6 text-[#6B6B6B] text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-[#E5E5E0]">
            {categories.map((cat, i) => {
              const isDeleted = deletedIds.has(cat.id)
              const isEditing = editing === cat.id
              return (
                <li
                  key={cat.id}
                  draggable={!isDeleted && !isEditing}
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                  className={isDeleted ? 'opacity-50' : 'group'}
                >
                  {isEditing ? (
                    <div className="px-4 py-4 space-y-3 bg-[#FAFAF8] border-l-2 border-[#E8A020]">
                      <p className="text-xs font-semibold text-[#E8A020] uppercase tracking-wider">Editing — click Save changes to publish</p>
                      <div>
                        <label className="block text-xs text-[#6B6B6B] mb-1">Title</label>
                        <input
                          value={editFields.title ?? ''}
                          onChange={(e) => setEditFields({ ...editFields, title: e.target.value, slug: autoSlug(e.target.value) })}
                          onKeyDown={(e) => e.key === 'Enter' && applyEdit(cat.id)}
                          className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                          placeholder="Category title"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6B6B] mb-1">Slug</label>
                        <input
                          value={editFields.slug ?? ''}
                          onChange={(e) => setEditFields({ ...editFields, slug: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm font-mono focus:outline-none focus:border-[#E8A020] bg-white"
                          placeholder="slug"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6B6B] mb-1">Description (optional)</label>
                        <textarea
                          value={editFields.description ?? ''}
                          onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] resize-none bg-white"
                          placeholder="Short description…"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyEdit(cat.id)}
                          className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-semibold rounded-sm hover:bg-black transition-colors"
                        >
                          Apply edit
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-3 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] transition-colors">
                      {/* Drag handle */}
                      {!isDeleted && (
                        <span className="cursor-grab active:cursor-grabbing text-[#C5C5C0] hover:text-[#9B9B9B] select-none shrink-0" title="Drag to reorder">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDeleted ? 'line-through text-[#9B9B9B]' : ''}`}>{cat.title}</p>
                        <p className="text-xs text-[#9B9B9B] font-mono">/{cat.slug}</p>
                        {cat.description && (
                          <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">{cat.description}</p>
                        )}
                      </div>

                      {!isDeleted && (
                        <>
                          {/* Nav toggle */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-[#9B9B9B]">Nav</span>
                            <button
                              onClick={() => toggleNav(cat.id)}
                              title={cat.show_in_nav !== false ? 'Shown in nav' : 'Hidden from nav'}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.show_in_nav !== false ? 'bg-[#E8A020]' : 'bg-[#D5D5D0]'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${cat.show_in_nav !== false ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => startEdit(cat)} className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Edit</button>
                            <button onClick={() => markDelete(cat.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                          </div>
                        </>
                      )}

                      {isDeleted && (
                        <button onClick={() => unmarkDelete(cat.id)} className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors shrink-0">
                          Undo
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ── Feedback ── */}
      {saved && (
        <p className="text-green-600 text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          All changes saved and published to the site.
        </p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* ── Save changes bar ── */}
      {isDirty && (
        <div className="flex items-center gap-3 p-4 bg-[#FFF8EC] border border-[#E8A020]/40 rounded-sm">
          <svg className="w-4 h-4 text-[#E8A020] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <p className="text-sm text-[#1A1A1A] flex-1">You have unsaved changes.</p>
          <button
            onClick={() => {
              setCategories(sortedCats(initialRef.current))
              setDeletedIds(new Set())
              setEditing(null)
            }}
            className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            Discard
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            className="px-4 py-2 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60 min-w-[120px]"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      {/* ── Add new ── */}
      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-4 py-2.5 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white"
          placeholder="New category name…"
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          className="px-4 py-2.5 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <p className="text-xs text-[#9B9B9B]">
        Toggle nav, drag to reorder, edit, or delete — then click <strong>Save changes</strong> to publish everything at once.
      </p>
    </div>
  )
}
