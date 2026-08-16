'use client'

import { useEffect, useState } from 'react'
import { Building2, MapPin, Phone, Mail, Coins, Save, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useGymSession } from '@/lib/auth/use-gym-session'
import type { Settings } from '@/lib/types'
import {
  PageHeader,
  Button,
  CardContainer,
  SectionTitle,
} from '@/components/ui/primitives'

export default function SettingsPage() {
  const { session } = useGymSession()
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!session) return
    const supabase = createClient()
    supabase
      .from('settings')
      .select('*')
      .eq('gym_id', session.gymId)
      .single()
      .then(({ data }) => {
        setSettings(data ?? {})
        setLoading(false)
      })
  }, [session])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session) return
    setSaving(true)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    const payload = {
      gym_id: session.gymId,
      gym_name: String(fd.get('gym_name') ?? ''),
      address: String(fd.get('address') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? ''),
      currency: String(fd.get('currency') ?? ''),
    }
    const supabase = createClient()
    // Upsert by gym_id (unique constraint)
    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'gym_id' })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setSettings((s) => ({ ...s, ...payload }))
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(error.message)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500'

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
          Loading settings…
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Configure your gym's profile and preferences" />

      {saved && (
        <div className="animate-fade-in flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Gym Profile */}
        <CardContainer>
          <SectionTitle icon={Building2}>Gym Profile</SectionTitle>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name</label>
              <input
                name="gym_name"
                defaultValue={settings.gym_name ?? ''}
                placeholder="e.g. Power House Gym"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="address"
                  defaultValue={settings.address ?? ''}
                  placeholder="Street, City, Country"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="phone"
                    defaultValue={settings.phone ?? ''}
                    placeholder="+92 300 1234567"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    defaultValue={settings.email ?? ''}
                    placeholder="gym@example.com"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContainer>

        {/* Preferences */}
        <CardContainer>
          <SectionTitle icon={Coins}>Preferences</SectionTitle>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
            <select name="currency" defaultValue={settings.currency ?? 'PKR'} className={inputCls}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — Pound Sterling</option>
              <option value="INR">INR — Indian Rupee</option>
            </select>
            <p className="mt-2 text-xs text-slate-400">
              This will be used to format monetary values across the dashboard.
            </p>
          </div>
        </CardContainer>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
