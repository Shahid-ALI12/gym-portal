'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react'
import { loginGymOwner } from '@/lib/auth'

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3.5 py-2.5 pl-10 text-sm text-white transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export default function GymLoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')

    const res = await loginGymOwner(email, password)
    setSubmitting(false)

    if ('error' in res) {
      setError(res.error || 'Login failed')
      return
    }

    // Successfully logged in — redirect to dashboard
    router.push('/')
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Gym Owner Login</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to manage your gym&apos;s members, payments, and inventory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@gym.com"
            className={inputCls}
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputCls}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-slate-700/50 pt-4">
        <p className="text-xs text-slate-500">Don&apos;t have an account?</p>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
