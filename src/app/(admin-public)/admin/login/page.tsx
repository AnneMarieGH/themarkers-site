import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Sign In | The Markers Admin' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-serif text-2xl font-bold">The Markers</p>
          <p className="text-[#6B6B6B] text-sm mt-1">Editorial desk</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
