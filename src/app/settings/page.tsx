'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Settings } from '@/lib/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setSettings(data ?? {})
        setLoading(false)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    const payload = {
      gym_name: String(fd.get('gym_name') ?? ''),
      address: String(fd.get('address') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? ''),
      currency: String(fd.get('currency') ?? ''),
    }
    const supabase = createClient()
    const { error } = await supabase.from('settings').upsert({ id: 1, ...payload }).eq('id', 1)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setSettings((s) => ({ ...s, ...payload }))
    } else {
      alert(error.message)
    }
  }

  const cls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">Loading settings…</div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {saved && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Gym Name</label>
          <input
            name="gym_name"
            defaultValue={settings.gym_name ?? ''}
            className={cls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input name="address" defaultValue={settings.address ?? ''} className={cls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input name="phone" defaultValue={settings.phone ?? ''} className={cls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" defaultValue={settings.email ?? ''} className={cls} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Currency</label>
          <select name="currency" defaultValue={settings.currency ?? 'PKR'} className={cls}>
            <option value="PKR">PKR — Pakistani Rupee</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — Pound Sterling</option>
            <option value="INR">INR — Indian Rupee</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
