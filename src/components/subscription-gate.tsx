'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert, LogOut } from 'lucide-react'

interface GymStatus {
  subscription_status: string
  subscription_expires: string | null
  name: string
}

export function SubscriptionGate({
  gymId,
  children,
}: {
  gymId: string
  children: React.ReactNode
}) {
  const [status, setStatus] = useState<GymStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('gyms')
      .select('subscription_status, subscription_expires, name')
      .eq('id', gymId)
      .single()
      .then(({ data }) => {
        setStatus(data as GymStatus | null)
        setLoading(false)
      })
  }, [gymId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    )
  }

  if (!status) {
    return (
      <BlockedScreen
        title="Gym not found"
        message="Your gym account could not be located. Please contact the platform admin."
      />
    )
  }

  // Allow: active, trial. Block: suspended, expired.
  if (status.subscription_status === 'suspended') {
    return (
      <BlockedScreen
        title="Subscription Suspended"
        message="Your gym's subscription has been suspended by the platform admin. Please contact support to reactivate."
        gymName={status.name}
      />
    )
  }

  if (status.subscription_status === 'expired') {
    return (
      <BlockedScreen
        title="Subscription Expired"
        message="Your gym's subscription has expired. Please renew to continue using the portal."
        gymName={status.name}
      />
    )
  }

  // Check if expiry date has passed (even if status not updated)
  if (status.subscription_expires) {
    const expiry = new Date(status.subscription_expires)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (expiry < today) {
      return (
        <BlockedScreen
          title="Subscription Expired"
          message={`Your subscription expired on ${expiry.toLocaleDateString()}. Please contact the platform admin to renew.`}
          gymName={status.name}
        />
      )
    }
  }

  return <>{children}</>
}

function BlockedScreen({
  title,
  message,
  gymName,
}: {
  title: string
  message: string
  gymName?: string
}) {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-lg dark:border-amber-500/30 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-white" />
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
        </div>
        <div className="p-6">
          {gymName && (
            <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">{gymName}</p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
          <button
            onClick={handleLogout}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
