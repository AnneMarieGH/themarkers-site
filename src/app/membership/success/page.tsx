'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!sessionId) { setReady(true); return }
    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then(() => setReady(true))
      .catch(() => setReady(true))
  }, [sessionId])

  if (!ready) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-[#6B6B6B]">Activating your membership…</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">✦</div>
      <h1 className="font-serif text-4xl font-bold text-[#1A1A1A] mb-4">Welcome, Member.</h1>
      <p className="text-[#6B6B6B] text-lg mb-8">
        Your membership is active. Thank you for supporting Asian Australian storytelling.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/articles"
          className="px-6 py-3 bg-[#C9A96E] text-white font-semibold rounded-sm hover:bg-[#A8853A] transition-colors"
        >
          Read Premium Stories
        </Link>
        <Link
          href="/membership"
          className="px-6 py-3 border border-[#E5E5E0] text-[#1A1A1A] font-semibold rounded-sm hover:border-[#C9A96E] transition-colors"
        >
          Manage Membership
        </Link>
      </div>
    </main>
  )
}

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto px-4 py-24 text-center"><p className="text-[#6B6B6B]">Loading…</p></main>}>
      <SuccessContent />
    </Suspense>
  )
}
