'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { loginSchema, LoginFormData } from '@/schemas/auth'
import { signIn } from '@/lib/auth'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const { error } = await signIn(data.email, data.password)
    if (error) {
      setServerError(error.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-[#faf9f6]">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a18] flex-col justify-between p-12">
        <div>
          <p className="font-serif text-[22px] tracking-wide text-[#f0ece4]">Mise en Place</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#f0ece4]/30">
            Restaurant OS
          </p>
        </div>
        <div>
          <p className="font-serif text-3xl text-[#f0ece4] leading-snug">
            Everything in its place,<br />every guest remembered.
          </p>
          <p className="mt-4 text-[13px] text-[#f0ece4]/40 leading-relaxed max-w-sm">
            Manage bookings, floor plans, and guest relationships — all from one panel.
          </p>
        </div>
        <p className="text-[11px] text-[#f0ece4]/20">© 2026 Mise en Place</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <p className="font-serif text-[20px] tracking-wide text-[#1a1a18]">Mise en Place</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#1a1a18]/30">
              Restaurant OS
            </p>
          </div>

          <h1 className="text-[22px] font-medium text-[#1a1a18] mb-1">Welcome back</h1>
          <p className="text-[13px] text-[#1a1a18]/40 mb-8">Sign in to your restaurant panel</p>

          <div className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[#1a1a18]/60 mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@restaurant.com"
                className="w-full bg-white border border-[#1a1a18]/12 rounded-lg px-3.5 py-2.5 text-[13px] text-[#1a1a18] placeholder:text-[#1a1a18]/25 focus:outline-none focus:border-[#1a1a18]/30 focus:ring-2 focus:ring-[#1a1a18]/6 transition-colors"
              />
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1a1a18]/60 mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(onSubmit)()}
                className="w-full bg-white border border-[#1a1a18]/12 rounded-lg px-3.5 py-2.5 text-[13px] text-[#1a1a18] placeholder:text-[#1a1a18]/25 focus:outline-none focus:border-[#1a1a18]/30 focus:ring-2 focus:ring-[#1a1a18]/6 transition-colors"
              />
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                <p className="text-[12px] text-red-600">{serverError}</p>
              </div>
            )}

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-[#1a1a18] text-[#f0ece4] rounded-lg px-4 py-2.5 text-[13px] font-medium hover:bg-[#2a2a26] disabled:opacity-40 transition-colors mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}