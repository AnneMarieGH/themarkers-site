'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AdminUser } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'editor']),
})

type FormValues = z.infer<typeof schema>

export function UsersManager({ users: initial }: { users: AdminUser[] }) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'editor' },
  })

  async function onSubmit(data: FormValues) {
    setServerError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const user = await res.json()
      setUsers([...users, user])
      reset()
      setShowForm(false)
    } else {
      const d = await res.json().catch(() => ({}))
      setServerError(d.error ?? 'Failed to create user.')
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove this user?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white border border-[#E5E5E0] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#E5E5E0] bg-[#F5F5F3]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden sm:table-cell">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E0]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F5F5F3]">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6B6B6B] hidden sm:table-cell">{formatDateShort(user.created_at)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleRemove(user.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors"
        >
          + Add user
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E5E5E0] rounded-sm p-4 space-y-3">
          <h3 className="font-semibold text-sm">New user</h3>
          {serverError && <p className="text-red-500 text-xs">{serverError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Name</label>
              <input {...register('name')} className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020]" />
              {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Role</label>
              <select {...register('role')} className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Email</label>
            <input {...register('email')} type="email" className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020]" />
            {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Password</label>
            <input {...register('password')} type="password" className="w-full px-3 py-2 border border-[#E5E5E0] rounded-sm text-sm focus:outline-none focus:border-[#E8A020]" />
            {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors disabled:opacity-60">
              {isSubmitting ? 'Creating…' : 'Create user'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); reset(); setServerError('') }} className="px-4 py-2 border border-[#E5E5E0] text-sm rounded-sm hover:bg-[#F5F5F3] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
