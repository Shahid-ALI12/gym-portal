'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Power, RotateCcw, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GymRow {
  id: string
  name: string
  owner_email: string
  owner_name: string
  phone: string
  address: string
  subscription_status: string
  subscription_plan: string
  subscription_expires: string
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500'

const planDays: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 }

export function ManageGymForm({ gym }: { gym: GymRow }) {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function updateFields(fields: Partial<GymRow>, msg: string) {
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('gyms').update(fields).eq('id', gym.id)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
    router.refresh()
  }

  async function handleSaveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await updateFields(
      {
        name: String(fd.get('name') ?? '').trim(),
        owner_name: String(fd.get('owner_name') ?? '').trim(),
        owner_email: String(fd.get('owner_email') ?? '').trim().toLowerCase(),
        phone: String(fd.get('phone') ?? '').trim(),
        address: String(fd.get('address') ?? '').trim(),
      },
      'Details updated'
    )
  }

  async function handleSubscription(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const plan = String(fd.get('subscription_plan') ?? 'monthly')
    const status = String(fd.get('subscription_status') ?? 'trial')
    const expiresRaw = String(fd.get('subscription_expires') ?? '')
    await updateFields(
      {
        subscription_plan: plan,
        subscription_status: status,
        subscription_expires: expiresRaw || undefined,
      },
      'Subscription updated'
    )
  }

  async function extendSubscription(days: number) {
    const base = gym.subscription_expires ? new Date(gym.subscription_expires) : new Date()
    // If expiry already passed, start from today
    if (base.getTime() < Date.now()) base.setTime(Date.now())
    base.setDate(base.getDate() + days)
    await updateFields(
      {
        subscription_status: 'active',
        subscription_expires: base.toISOString().slice(0, 10),
      },
      `Extended by ${days} days & activated`
    )
  }

  async function toggleSuspend() {
    const next = gym.subscription_status === 'suspended' ? 'active' : 'suspended'
    await updateFields({ subscription_status: next }, next === 'suspended' ? 'Gym suspended' : 'Gym reactivated')
  }

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const newPwd = String(fd.get('new_password') ?? '')
    if (newPwd.length < 6) {
      setError('Password must be at least 6 characters')
      setSubmitting(false)
      return
    }
    // Use server action via fetch — for prototype, use supabase RPC-less approach:
    // Hashing must happen server-side. Call /api/admin/reset-password.
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gym_id: gym.id, new_password: newPwd }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error || 'Failed to reset password')
      return
    }
    setToast('Password reset — owner can use new password')
    setTimeout(() => setToast(null), 3000)
    ;(e.target as HTMLFormElement).reset()
  }

  async function deleteGym() {
    if (!confirm(`Delete "${gym.name}"? This deletes ALL members, payments, plans, products, sales, expenses for this gym. Cannot be undone.`)) return
    setSubmitting(true)
    const { error } = await supabase.from('gyms').delete().eq('id', gym.id)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Gym details */}
      <form onSubmit={handleSaveDetails} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Gym Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name</label>
            <input name="name" defaultValue={gym.name} required className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Name</label>
            <input name="owner_name" defaultValue={gym.owner_name} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Email</label>
            <input name="owner_email" type="email" defaultValue={gym.owner_email} required className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
            <input name="phone" defaultValue={gym.phone} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
            <input name="address" defaultValue={gym.address} className={inputCls} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300">
            <Save className="h-4 w-4" /> Save Details
          </button>
        </div>
      </form>

      {/* Subscription control */}
      <form onSubmit={handleSubscription} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">Subscription Control</h2>
        <p className="mb-4 text-xs text-slate-500">Activate, suspend, or change the subscription plan for this gym.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select name="subscription_status" defaultValue={gym.subscription_status} className={inputCls}>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
            <select name="subscription_plan" defaultValue={gym.subscription_plan} className={inputCls}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Expires On</label>
            <input name="subscription_expires" type="date" defaultValue={gym.subscription_expires ?? ''} className={inputCls} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => extendSubscription(30)} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
              <RotateCcw className="h-3.5 w-3.5" /> +30 days
            </button>
            <button type="button" onClick={() => extendSubscription(90)} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
              <RotateCcw className="h-3.5 w-3.5" /> +90 days
            </button>
            <button type="button" onClick={() => extendSubscription(365)} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
              <RotateCcw className="h-3.5 w-3.5" /> +1 year
            </button>
            <button type="button" onClick={toggleSuspend} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              <Power className="h-3.5 w-3.5" /> {gym.subscription_status === 'suspended' ? 'Reactivate' : 'Suspend'}
            </button>
          </div>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            <Save className="h-4 w-4" /> Save Subscription
          </button>
        </div>
      </form>

      {/* Reset owner password */}
      <form onSubmit={resetPassword} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">Reset Owner Password</h2>
        <p className="mb-4 text-xs text-slate-500">Use this if the gym owner forgets their password.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
            <input name="new_password" type="password" required minLength={6} placeholder="Min 6 characters" className={inputCls} />
          </div>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
            <RotateCcw className="h-4 w-4" /> Reset Password
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-500/30 dark:bg-rose-500/5">
        <h2 className="mb-1 text-base font-semibold text-rose-700 dark:text-rose-400">Danger Zone</h2>
        <p className="mb-4 text-xs text-rose-600 dark:text-rose-400/80">Permanently delete this gym and ALL its data (members, payments, plans, products, sales, expenses).</p>
        <button type="button" onClick={deleteGym} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
          <Trash2 className="h-4 w-4" /> Delete Gym Permanently
        </button>
      </div>
    </div>
  )
}
