'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface MediaItem {
  name: string
  url: string
  createdAt: string | null
  size: number | null
  alt: string
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchItems() {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are supported.')
      return
    }
    setUploadError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('alt', '')
    const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
    if (res.ok) {
      await fetchItems()
    } else {
      const json = await res.json().catch(() => ({}))
      setUploadError(json.error ?? 'Upload failed.')
    }
    setUploading(false)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }, [])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  async function deleteItem(item: MediaItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setDeleting(item.name)
    const res = await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item.name }),
    })
    setDeleting(null)
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.name !== item.name))
      if (selected?.name === item.name) setSelected(null)
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragOver ? 'border-[#E8A020] bg-[#E8A020]/5' : 'border-[#D5D5D0] hover:border-[#E8A020] bg-[#FAFAF8]'
        }`}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#E8A020] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B6B6B]">Uploading…</p>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 text-[#C5C5C0] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm font-medium text-[#1A1A1A]">Drop image here or click to upload</p>
            <p className="text-xs text-[#9B9B9B] mt-1">PNG, JPG, GIF, WebP, SVG</p>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">{uploadError}</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-sm text-[#6B6B6B]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-[#6B6B6B]">No media uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <div
              key={item.name}
              className="group relative aspect-square bg-[#F5F5F3] border border-[#E5E5E0] rounded-sm overflow-hidden cursor-pointer hover:border-[#E8A020] transition-colors"
              onClick={() => setSelected(item)}
            >
              <Image
                src={item.url}
                alt={item.alt || item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item.url) }}
                    className="flex-1 text-xs bg-white text-[#1A1A1A] font-medium py-1 rounded-sm hover:bg-[#E8A020] hover:text-white transition-colors"
                  >
                    {copied === item.url ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item) }}
                    disabled={deleting === item.name}
                    title="Delete"
                    className="px-2 py-1 bg-white text-red-500 rounded-sm hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-sm max-w-lg w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-[#F5F5F3]">
              <Image
                src={selected.url}
                alt={selected.alt || selected.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-[#9B9B9B] uppercase tracking-wide font-semibold mb-0.5">Filename</p>
                <p className="text-sm text-[#1A1A1A] font-mono truncate">{selected.name}</p>
              </div>
              {selected.alt && (
                <div>
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide font-semibold mb-0.5">Alt text</p>
                  <p className="text-sm text-[#1A1A1A]">{selected.alt}</p>
                </div>
              )}
              {selected.size && (
                <div>
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide font-semibold mb-0.5">Size</p>
                  <p className="text-sm text-[#1A1A1A]">{formatSize(selected.size)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#9B9B9B] uppercase tracking-wide font-semibold mb-1">URL</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={selected.url}
                    className="flex-1 text-xs border border-[#E5E5E0] rounded-sm px-2 py-1.5 bg-[#FAFAF8] font-mono truncate"
                  />
                  <button
                    onClick={() => copyUrl(selected.url)}
                    className="px-3 py-1.5 bg-[#E8A020] text-white text-xs font-semibold rounded-sm hover:bg-[#C8851A] transition-colors shrink-0"
                  >
                    {copied === selected.url ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => deleteItem(selected)}
                  disabled={deleting === selected.name}
                  className="flex-1 py-2 text-sm text-red-500 border border-red-200 rounded-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting === selected.name ? 'Deleting…' : 'Delete file'}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2 text-sm text-[#6B6B6B] border border-[#E5E5E0] rounded-sm hover:text-[#1A1A1A] hover:border-[#9B9B9B] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
