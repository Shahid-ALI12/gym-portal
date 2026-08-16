'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Save, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function RecordPaymentPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('members')
      .select('id, name, phone, status, plan:plans(name, price)')
      .order('name')
      .then(({ data }) => {
        setMembers((data ?? []) as unknown as Member[])
        setLoading(false)
      })
  }, [])

  // Generate invoice number: INV-YYYYMMDD-RANDOM
  function generateInvoiceNo() {
    const d = new Date()
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `INV-${ymd}-${rand}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const memberId = String(fd.get('member_id') ?? '')
    if (!memberId) {
      setError('Please select a member')
      setSubmitting(false)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('payments').insert({
      member_id: memberId,
      amount: Number(fd.get('amount')) || 0,
      payment_date: String(fd.get('payment_date')) || new Date().toISOString().slice(0, 10),
      method: String(fd.get('method') ?? 'cash'),
      status: String(fd.get('status') ?? 'paid'),
      invoice_no: generateInvoiceNo(),
      notes: String(fd.get('notes') ?? '').trim(),
    })
    setSubmitting(false)
    if (!error) router.push('/payments')
    else setError(error.message)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/payments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Payments
      </Link>

      <PageHeader title="Record Payment" description="Record a new payment from a member." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={User} title="Member & Amount">
          <FormField label="Member" required hint="Select the member making this payment">
            <select
              name="member_id"
              required
              className={inputCls}
              onChange={(e) => {
                const m = members.find((x) => x.id === e.target.value)
                setSelectedMember(m ?? null)
              }}
            >
              <option value="">— Select member —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.phone ? `· ${m.phone}` : ''}
                </option>
              ))}
            </select>
          </FormField>

          {selectedMember && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm dark:border-indigo-500/30 dark:bg-indigo-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Member</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedMember.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold capitalize text-slate-900 dark:text-white">{selectedMember.status}</p>
                </div>
              </div>
            </div>
          )}

          <FormField label="Amount (PKR)" required>
            <input name="amount" type="number" min={0} step="any" required placeholder="e.g. 3000" className={inputCls} />
          </FormField>

          <FormField label="Payment Date" required>
            <input
              name="payment_date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </FormField>
        </FormSection>

        <FormSection icon={CreditCard} title="Payment Method & Status">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Method" required>
              <select name="method" defaultValue="cash" className={inputCls}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </FormField>
            <FormField label="Status" required>
              <select name="status" defaultValue="paid" className={inputCls}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </FormField>
          </div>

          <FormField label="Notes" hint="Optional — any additional information">
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Membership renewal for 3 months"
              className={`${inputCls} resize-none`}
            />
          </FormField>

          <div className="rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
            ℹ️ An invoice number will be auto-generated (format: <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">INV-YYYYMMDD-XXXX</code>)
          </div>
        </FormSection>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <FormActions>
          <Link href="/payments">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Recording…' : 'Record Payment'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
