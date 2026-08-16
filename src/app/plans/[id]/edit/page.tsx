'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useGymSession } from '@/lib/auth/use-gym-session'
import type { Plan } from '@/lib/types'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { session } = useGymSession()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    const supabase = createClient()
    supabase
      .from('plans')
      .select('*')
      .eq('id', params.id)
      .eq('gym_id', session.gymId)
      .single()
      .then(({ data, error }) => {
        if (data) setPlan(data as Plan)
        else setError(error?.message ?? 'Plan not found')
        setLoading(false)
      })
  }, [params.id, session])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase
      .from('plans')
      .update({
        name: String(fd.get('name') ?? '').trim(),
        duration_days: Number(fd.get('duration_days')) || 30,
        price: Number(fd.get('price')) || 0,
        description: String(fd.get('description') ?? '').trim(),
      })
      .eq('id', params.id)
      .eq('gym_id', session!.gymId)
    setSubmitting(false)
    if (!error) router.push('/plans')
    else setError(error.message)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to Plans
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Plan not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Plans
      </Link>

      <PageHeader title="Edit Plan" description="Update the details of this membership plan." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Calendar} title="Plan Details">
          <FormField label="Plan Name" required>
            <input name="name" required defaultValue={plan.name} className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Duration (days)" required>
              <input name="duration_days" type="number" min={1} required defaultValue={plan.duration_days} className={inputCls} />
            </FormField>
            <FormField label="Price (PKR)" required>
              <input name="price" type="number" min={0} step="any" required defaultValue={plan.price} className={inputCls} />
            </FormField>
          </div>

          <FormField label="Description" hint="Optional — shown on the plan card">
            <textarea
              name="description"
              rows={3}
              defaultValue={plan.description ?? ''}
              className={`${inputCls} resize-none`}
            />
          </FormField>
        </FormSection>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <FormActions>
          <Link href="/plans">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Update Plan'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
