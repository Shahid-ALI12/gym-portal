'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useGymSession } from '@/lib/auth/use-gym-session'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function AddPlanPage() {
  const router = useRouter()
  const { session } = useGymSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session) return
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('plans').insert({
      gym_id: session.gymId,
      name: String(fd.get('name') ?? '').trim(),
      duration_days: Number(fd.get('duration_days')) || 30,
      price: Number(fd.get('price')) || 0,
      description: String(fd.get('description') ?? '').trim(),
    })
    setSubmitting(false)
    if (!error) router.push('/plans')
    else setError(error.message)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Plans
      </Link>

      <PageHeader title="Add New Plan" description="Create a new membership plan for your gym." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Calendar} title="Plan Details">
          <FormField label="Plan Name" required>
            <input name="name" required placeholder="e.g. Monthly, Quarterly, Yearly" className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Duration (days)" required hint="e.g. 30 for monthly, 365 for yearly">
              <input name="duration_days" type="number" min={1} required defaultValue={30} className={inputCls} />
            </FormField>
            <FormField label="Price (PKR)" required>
              <input name="price" type="number" min={0} step="any" required placeholder="e.g. 3000" className={inputCls} />
            </FormField>
          </div>

          <FormField label="Description" hint="Optional — shown on the plan card">
            <textarea
              name="description"
              rows={3}
              placeholder="What's included in this plan?"
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
            {submitting ? 'Saving…' : 'Save Plan'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
