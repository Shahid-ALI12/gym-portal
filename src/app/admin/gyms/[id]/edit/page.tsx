import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { ManageGymForm } from './form'

export const metadata: Metadata = { title: 'Manage Gym — Admin' }
export const dynamic = 'force-dynamic'

export default async function ManageGymPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return null

  const { id } = await params
  const supabase = await createClient()
  const { data: gym } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', id)
    .single()

  if (!gym) notFound()

  // Count members for this gym
  const { count: memberCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', id)

  const { count: paymentCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', id)

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

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{gym.name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Owner: {gym.owner_name || '—'} · {gym.owner_email}
        </p>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Members</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{memberCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Payments</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{paymentCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Created</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{formatDate(gym.created_at)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Plan</p>
            <p className="mt-1 text-sm font-medium capitalize text-slate-900 dark:text-white">{gym.subscription_plan}</p>
          </div>
        </div>

        {/* Manage form */}
        <div className="mt-6">
          <ManageGymForm gym={gym} />
        </div>
      </main>
    </div>
  )
}
