'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'Please enter your name'),
})

type FormValues = z.infer<typeof schema>

export function NewsletterSignup({ variant = 'full' }: { variant?: 'full' | 'inline' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormValues) {
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Something went wrong. Please try again.')
      }
      setState('success')
      reset()
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (variant === 'inline') {
    return (
      <div className="max-w-xl">
        {state === 'success' ? (
          <p className="text-[#E8A020] font-medium text-sm">You're subscribed. Welcome to The Markers.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
            <input
              {...register('firstName')}
              type="text"
              placeholder="First name"
              className="flex-1 px-4 py-2.5 text-sm border border-[#E5E5E0] rounded-sm focus:outline-none focus:border-[#E8A020] bg-white"
            />
            <input
              {...register('email')}
              type="email"
              placeholder="Email address"
              className="flex-1 px-4 py-2.5 text-sm border border-[#E5E5E0] rounded-sm focus:outline-none focus:border-[#E8A020] bg-white"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="px-6 py-2.5 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60"
            >
              {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
        {state === 'error' && <p className="text-red-500 text-xs mt-2">{errorMsg}</p>}
      </div>
    )
  }

  return (
    <section className="bg-[#1A1A1A] text-white py-16 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-3">Newsletter</p>
        <h2 className="font-playfair font-bold text-3xl sm:text-4xl mb-4">
          Stories worth reading, delivered to your inbox
        </h2>
        <p className="text-[#999] text-base mb-8 leading-relaxed">
          Join our community of readers discovering Asian Australian excellence. No noise — just our best stories, curated weekly.
        </p>

        {state === 'success' ? (
          <div className="bg-[#E8A020]/10 border border-[#E8A020]/30 rounded-sm px-6 py-5">
            <p className="text-[#E8A020] font-semibold text-lg mb-1">Welcome aboard.</p>
            <p className="text-[#999] text-sm">Check your inbox for a confirmation email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                {...register('firstName')}
                type="text"
                placeholder="First name"
                className="w-full px-4 py-3 text-sm bg-white/10 border border-white/20 rounded-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#E8A020] transition-colors"
              />
              {errors.firstName && <p className="text-red-400 text-xs mt-1 text-left">{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 text-sm bg-white/10 border border-white/20 rounded-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#E8A020] transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 text-left">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={state === 'loading'}
              className="px-6 py-3 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {state === 'loading' ? 'Subscribing…' : 'Get the newsletter'}
            </button>
          </form>
        )}

        {state === 'error' && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}

        <p className="text-[#666] text-xs mt-4">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  )
}
