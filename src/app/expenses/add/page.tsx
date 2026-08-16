'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Receipt, Save } from 'lucide-react'
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

export default function AddExpensePage() {
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
    const { error } = await supabase.from('expenses').insert({
      gym_id: session.gymId,
      category: String(fd.get('category') ?? 'other'),
      amount: Number(fd.get('amount')) || 0,
      date: String(fd.get('date')) || new Date().toISOString().slice(0, 10),
      description: String(fd.get('description') ?? '').trim(),
    })
    setSubmitting(false)
    if (!error) router.push('/expenses')
    else setError(error.message)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/expenses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Expenses
      </Link>

      <PageHeader title="Add New Expense" description="Record a new business expense." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Receipt} title="Expense Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Category" required>
              <select name="category" defaultValue="other" className={inputCls}>
                <option value="rent">Rent</option>
                <option value="salary">Salary</option>
                <option value="utilities">Utilities (electricity, water, internet)</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Amount (PKR)" required>
              <input name="amount" type="number" min={0} step="any" required placeholder="e.g. 5000" className={inputCls} />
            </FormField>
          </div>

          <FormField label="Date" required>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </FormField>

          <FormField label="Description" hint="Optional — what was this expense for?">
            <textarea
              name="description"
              rows={3}
              placeholder="e.g. Monthly electricity bill"
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
          <Link href="/expenses">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Save Expense'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
