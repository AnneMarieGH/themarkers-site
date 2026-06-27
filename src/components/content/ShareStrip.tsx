'use client'

import { useState } from 'react'

interface ShareStripProps {
  title: string
}

export function ShareStrip({ title }: ShareStripProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center gap-6 px-5 border-t border-[#E5E5E0] bg-[#FAFAF8]/90 backdrop-blur-sm">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A] hover:text-[#E8A020] transition-colors"
        aria-label="Share article"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>{copied ? 'Link copied!' : 'Share'}</span>
      </button>
    </div>
  )
}
