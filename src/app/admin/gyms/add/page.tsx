import type { Metadata } from 'next'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { AddGymForm } from './form'

export const metadata: Metadata = { title: 'Add Gym — Admin' }
export const dynamic = 'force-dynamic'

export default async function AddGymPage() {
  const admin = await requireAdmin()
  if (!admin) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Super Admin Portal</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Gym</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a new gym owner account. The owner will sign in at{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">/login</code>{' '}
          with their email and password.
        </p>

        <div className="mt-6">
          <AddGymForm />
        </div>
      </main>
    </div>
  )
}
