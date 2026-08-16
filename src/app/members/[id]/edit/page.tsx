'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Plan, Trainer, Member } from '@/lib/types'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [joinDate, setJoinDate] = useState('')

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('members').select('*').eq('id', params.id).single(),
      supabase.from('plans').select('*').order('price'),
      supabase.from('trainers').select('*').eq('status', 'active').order('name'),
    ]).then(([m, p, t]) => {
      if (m.data) {
        const mem = m.data as Member
        setMember(mem)
        setJoinDate(mem.join_date?.slice(0, 10) ?? '')
        const plan = (p.data ?? []).find((x: Plan) => x.id === mem.plan_id) ?? null
        setSelectedPlan(plan)
      } else {
        setError(m.error?.message ?? 'Member not found')
      }
      if (p.data) setPlans(p.data as Plan[])
      if (t.data) setTrainers(t.data as Trainer[])
      setLoading(false)
    })
  }, [params.id])

  const expiryDate = selectedPlan && joinDate
    ? new Date(new Date(joinDate).getTime() + selectedPlan.duration_days * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : member?.expiry_date?.slice(0, 10) ?? null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const plan_id = (fd.get('plan_id') as string) || null

    let expiry_date: string | null = null
    if (plan_id) {
      const plan = plans.find((p) => p.id === plan_id)
      const join = new Date((fd.get('join_date') as string) || Date.now())
      if (plan) {
        const exp = new Date(join)
        exp.setDate(exp.getDate() + plan.duration_days)
        expiry_date = exp.toISOString().slice(0, 10)
      }
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('members')
      .update({
        name: String(fd.get('name') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
        email: String(fd.get('email') ?? '').trim(),
        address: String(fd.get('address') ?? '').trim(),
        gender: String(fd.get('gender') ?? 'male'),
        dob: (fd.get('dob') as string) || null,
        plan_id,
        trainer_id: (fd.get('trainer_id') as string) || null,
        join_date: fd.get('join_date') || new Date().toISOString().slice(0, 10),
        expiry_date,
        status: String(fd.get('status') ?? 'active'),
      })
      .eq('id', params.id)
    setSubmitting(false)
    if (!error) router.push('/members')
    else setError(error.message)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/members" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Member not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>

      <PageHeader title="Edit Member" description={`Update details for ${member.name}`} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <FormSection icon={User} title="Personal Information">
          <FormField label="Full Name" required>
            <input name="name" required defaultValue={member.name} className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone">
              <input name="phone" type="tel" defaultValue={member.phone} className={inputCls} />
            </FormField>
            <FormField label="Email">
              <input name="email" type="email" defaultValue={member.email} className={inputCls} />
            </FormField>
          </div>

          <FormField label="Address">
            <input name="address" defaultValue={member.address} className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Gender">
              <select name="gender" defaultValue={member.gender} className={inputCls}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input name="dob" type="date" defaultValue={member.dob?.slice(0, 10) ?? ''} className={inputCls} />
            </FormField>
          </div>
        </FormSection>

        {/* Membership */}
        <FormSection icon={Calendar} title="Membership Details">
          <FormField label="Plan">
            <select
              name="plan_id"
              className={inputCls}
              defaultValue={member.plan_id ?? ''}
              onChange={(e) => {
                const plan = plans.find((p) => p.id === e.target.value)
                setSelectedPlan(plan ?? null)
              }}
            >
              <option value="">— Select plan —</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.duration_days} days
                </option>
              ))}
            </select>
            {selectedPlan && (
              <p className="mt-1.5 text-xs text-slate-500">
                Price: <span className="font-medium text-indigo-600 dark:text-indigo-400">PKR {selectedPlan.price.toLocaleString()}</span> · Duration: {selectedPlan.duration_days} days
              </p>
            )}
          </FormField>

          <FormField label="Trainer (optional)">
            <select name="trainer_id" defaultValue={member.trainer_id ?? ''} className={inputCls}>
              <option value="">— No trainer —</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.specialization}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Join Date">
              <input
                name="join_date"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="Expiry Date (auto)">
              <input
                type="date"
                value={expiryDate ?? ''}
                readOnly
                className={`${inputCls} cursor-not-allowed bg-slate-50 dark:bg-slate-800/30`}
              />
            </FormField>
          </div>

          <FormField label="Status">
            <select name="status" defaultValue={member.status} className={inputCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </FormField>
        </FormSection>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <FormActions>
          <Link href="/members">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Update Member'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
