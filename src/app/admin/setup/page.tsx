'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react'
import { createSuperAdmin, loginSuperAdmin } from '@/lib/auth'

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3.5 py-2.5 pl-10 text-sm text-white transition-all placeholder:text-slate-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20'

export default function SetupPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const confirm = String(fd.get('confirm') ?? '')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setSubmitting(false)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      setSubmitting(false)
      return
    }

    try {
      await createSuperAdmin(email, password, name)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create admin'
      setError(msg)
      setSubmitting(false)
      return
    }

    // Auto-login
    const loginRes = await loginSuperAdmin(email, password)
    setSubmitting(false)
    if ('error' in loginRes) {
      setError('Admin created but login failed — please sign in manually')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        ⚠️ This page creates the <strong>super admin</strong> account. Once created, this page
        will refuse to create another. Bookmark these credentials safely.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="name"
            required
            placeholder="Your name (e.g. Shahid)"
            className={inputCls}
          />
        </div>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="email"
            type="email"
            required
            placeholder="admin@gymportal.com"
            className={inputCls}
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            className={inputCls}
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="confirm"
            type="password"
            required
            placeholder="Confirm password"
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          {submitting ? 'Creating admin…' : 'Create Super Admin'}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-700/50 pt-4">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin login
        </Link>
      </div>
    </div>
  )
}
