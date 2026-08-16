'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Save } from 'lucide-react'
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

export default function AddTrainerPage() {
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
    const { error } = await supabase.from('trainers').insert({
      gym_id: session.gymId,
      name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      specialization: String(fd.get('specialization') ?? '').trim(),
      salary: Number(fd.get('salary')) || 0,
      status: String(fd.get('status') ?? 'active'),
    })
    setSubmitting(false)
    if (!error) router.push('/trainers')
    else setError(error.message)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/trainers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Trainers
      </Link>

      <PageHeader title="Add New Trainer" description="Add a new trainer to your team." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Dumbbell} title="Trainer Information">
          <FormField label="Full Name" required>
            <input name="name" required placeholder="e.g. John Doe" className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone">
              <input name="phone" type="tel" placeholder="+92 300 1234567" className={inputCls} />
            </FormField>
            <FormField label="Specialization" hint="e.g. Strength, Cardio, Yoga">
              <input name="specialization" placeholder="e.g. Strength Training" className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Monthly Salary (PKR)" required>
              <input name="salary" type="number" min={0} step="any" required placeholder="e.g. 50000" className={inputCls} />
            </FormField>
            <FormField label="Status">
              <select name="status" defaultValue="active" className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <FormActions>
          <Link href="/trainers">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Save Trainer'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
