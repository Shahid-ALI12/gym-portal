'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Trainer } from '@/lib/types'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function EditTrainerPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('trainers')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data, error }) => {
        if (data) setTrainer(data as Trainer)
        else setError(error?.message ?? 'Trainer not found')
        setLoading(false)
      })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase
      .from('trainers')
      .update({
        name: String(fd.get('name') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
        specialization: String(fd.get('specialization') ?? '').trim(),
        salary: Number(fd.get('salary')) || 0,
        status: String(fd.get('status') ?? 'active'),
      })
      .eq('id', params.id)
    setSubmitting(false)
    if (!error) router.push('/trainers')
    else setError(error.message)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/trainers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to Trainers
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Trainer not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/trainers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Trainers
      </Link>

      <PageHeader title="Edit Trainer" description="Update the trainer's details." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Dumbbell} title="Trainer Information">
          <FormField label="Full Name" required>
            <input name="name" required defaultValue={trainer.name} className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone">
              <input name="phone" type="tel" defaultValue={trainer.phone} className={inputCls} />
            </FormField>
            <FormField label="Specialization">
              <input name="specialization" defaultValue={trainer.specialization} className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Monthly Salary (PKR)" required>
              <input name="salary" type="number" min={0} step="any" required defaultValue={trainer.salary} className={inputCls} />
            </FormField>
            <FormField label="Status">
              <select name="status" defaultValue={trainer.status} className={inputCls}>
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
            {submitting ? 'Saving…' : 'Update Trainer'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
