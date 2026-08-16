'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Save } from 'lucide-react'
import { createGym } from '@/lib/auth'

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500'

const planDays: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
}

export function AddGymForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)

    const plan = String(fd.get('subscription_plan') ?? 'monthly')
    const res = await createGym({
      name: String(fd.get('name') ?? '').trim(),
      owner_email: String(fd.get('owner_email') ?? '').trim(),
      owner_password: String(fd.get('owner_password') ?? ''),
      owner_name: String(fd.get('owner_name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      address: String(fd.get('address') ?? '').trim(),
      subscription_plan: plan as 'monthly' | 'quarterly' | 'yearly',
      subscription_days: planDays[plan],
    })

    setSubmitting(false)
    if ('error' in res) {
      setError(res.error || null)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-rose-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Gym Details</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name *</label>
            <input name="name" required placeholder="e.g. Iron Fitness Gym" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
            <input name="phone" placeholder="+92 300 1234567" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
            <input name="address" placeholder="Lahore, Pakistan" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">Owner Account</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Name</label>
            <input name="owner_name" placeholder="e.g. Ahmed Khan" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Email *</label>
            <input name="owner_email" type="email" required placeholder="owner@gym.com" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Password *</label>
            <input name="owner_password" type="password" required minLength={6} placeholder="Min 6 characters" className={inputCls} />
            <p className="mt-1 text-xs text-slate-500">Owner can change this after first login (in a future update).</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">Subscription</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
            <select name="subscription_plan" defaultValue="monthly" className={inputCls}>
              <option value="monthly">Monthly (30 days)</option>
              <option value="quarterly">Quarterly (90 days)</option>
              <option value="yearly">Yearly (365 days)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Initial Status</label>
            <select name="subscription_status" defaultValue="trial" className={inputCls} disabled>
              <option value="trial">Trial</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">New gyms start on trial. You can activate after payment.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {submitting ? 'Creating gym…' : 'Create Gym'}
        </button>
      </div>
    </form>
  )
}
