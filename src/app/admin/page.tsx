import type { Metadata } from 'next'
import { ShieldCheck, LogOut, Plus, Building2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, logout } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin Dashboard — Gym Portal' }
export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  trial: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  suspended: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
  expired: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-700',
}

async function handleLogout() {
  'use server'
  await logout()
}

export default async function AdminDashboard() {
  const admin = await requireAdmin()
  if (!admin) return null

  const supabase = await createClient()
  const { data: gyms } = await supabase
    .from('gyms')
    .select('id, name, owner_email, owner_name, phone, subscription_status, subscription_plan, subscription_expires, created_at')
    .order('created_at', { ascending: false })

  // Counts by status
  const stats = {
    total: gyms?.length ?? 0,
    active: gyms?.filter((g) => g.subscription_status === 'active').length ?? 0,
    trial: gyms?.filter((g) => g.subscription_status === 'trial').length ?? 0,
    suspended: gyms?.filter((g) => g.subscription_status === 'suspended').length ?? 0,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Super Admin Portal</p>
              <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">{admin.email}</p>
            </div>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Gyms</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage gym subscriptions, activate or suspend access.
            </p>
          </div>
          <Link
            href="/admin/gyms/add"
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" /> Add New Gym
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Gyms</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">On Trial</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.trial}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Suspended</p>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.suspended}</p>
          </div>
        </div>

        {/* Gyms list */}
        {(gyms ?? []).length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-900 dark:text-white">No gyms yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add your first gym to grant them access to the portal.
            </p>
            <Link
              href="/admin/gyms/add"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" /> Add Gym
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Gym</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Expires</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(gyms ?? []).map((g) => (
                    <tr key={g.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{g.name}</p>
                          {g.phone && <p className="text-xs text-slate-500">{g.phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 dark:text-slate-300">{g.owner_name || '—'}</p>
                        <p className="text-xs text-slate-500">{g.owner_email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-300">{g.subscription_plan}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {g.subscription_expires ? formatDate(g.subscription_expires) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[g.subscription_status]}`}>
                          {g.subscription_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/gyms/${g.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
