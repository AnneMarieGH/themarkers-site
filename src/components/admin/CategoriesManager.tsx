'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/types'

export function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  async function handleCreate() {
    if (!newTitle.trim()) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), slug: autoSlug(newTitle.trim()) }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories([...categories, cat])
      setNewTitle('')
    } else {
      setError('Failed to create category.')
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white border border-[#E5E5E0] rounded-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-6 text-[#6B6B6B] text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-[#E5E5E0]">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{cat.title}</p>
                  <p className="text-xs text-[#6B6B6B] font-mono">/{cat.slug}</p>
                </div>
                <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="flex-1 px-4 py-2.5 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#C9A96E] bg-white"
          placeholder="New category name…"
        />
        <button
          onClick={handleCreate}
          disabled={saving}
          className="px-4 py-2.5 bg-[#C9A96E] text-white text-sm font-semibold rounded-sm hover:bg-[#A8853A] transition-colors disabled:opacity-60"
        >
          Add
        </button>
      </div>
    </div>
  )
}
