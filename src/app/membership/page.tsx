'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/stripe'

function PricingCard({
  planKey,
  plan,
  recommended,
}: {
  planKey: string
  plan: typeof PLANS[keyof typeof PLANS]
  recommended?: boolean
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = plan.amount / 100
  const label = plan.interval === 'year' ? '/year' : '/month'
  const monthly = plan.interval === 'year' ? `$${(plan.amount / 100 / 12).toFixed(2)}/mo` : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: planKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative border rounded-sm p-8 flex flex-col gap-6 ${recommended ? 'border-[#E8A020] shadow-md' : 'border-[#E5E5E0]'}`}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8A020] text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-sm">
          Best Value
        </div>
      )}
      <div>
        <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-1">{plan.name}</h3>
        <p className="text-[#6B6B6B] text-sm">{plan.description}</p>
      </div>
      <div>
        <span className="text-4xl font-bold text-[#1A1A1A]">${price}</span>
        <span className="text-[#6B6B6B] text-sm ml-1">{label}</span>
        {monthly && <p className="text-xs text-[#6B6B6B] mt-1">Equivalent to {monthly}</p>}
      </div>
      <ul className="space-y-2 text-sm text-[#1A1A1A]">
        <li className="flex items-center gap-2"><span className="text-[#E8A020]">✓</span> Unlimited premium articles</li>
        <li className="flex items-center gap-2"><span className="text-[#E8A020]">✓</span> Exclusive event access</li>
        <li className="flex items-center gap-2"><span className="text-[#E8A020]">✓</span> Members-only community</li>
        <li className="flex items-center gap-2"><span className="text-[#E8A020]">✓</span> Cancel anytime</li>
      </ul>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full border border-[#E5E5E0] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#E8A020]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60"
        >
          {loading ? 'Redirecting…' : 'Get Started'}
        </button>
        {error && <p className="text-red-600 text-xs">{error}</p>}
      </form>
    </div>
  )
}

function ManagePortal() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto mt-16 px-4 pb-16">
      <h2 className="font-serif text-xl font-bold text-center mb-2">Manage Your Membership</h2>
      <p className="text-[#6B6B6B] text-sm text-center mb-6">Enter your email to access the member portal, update billing, or cancel.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full border border-[#E5E5E0] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#E8A020]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 border border-[#E8A020] text-[#E8A020] text-sm font-semibold rounded-sm hover:bg-[#E8A020] hover:text-white transition-colors disabled:opacity-60"
        >
          {loading ? 'Opening portal…' : 'Open Billing Portal'}
        </button>
        {error && <p className="text-red-600 text-xs">{error}</p>}
      </form>
    </section>
  )
}

export default function MembershipPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-3">Membership</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4">
          Support independent<br />Asian Australian storytelling.
        </h1>
        <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto">
          Join our community and unlock exclusive content, events, and connections that celebrate and elevate Asian Australians.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PricingCard planKey="monthly" plan={PLANS.monthly} />
        <PricingCard planKey="annual" plan={PLANS.annual} recommended />
      </div>

      <ManagePortal />
    </main>
  )
}
