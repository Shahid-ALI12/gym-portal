'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, User, Phone, Calendar, Dumbbell, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Plan, Trainer } from '@/lib/types'
import { PageHeader, Button, CardContainer } from '@/components/ui/primitives'

export default function AddMemberPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('plans').select('*').order('price'),
      supabase.from('trainers').select('*').eq('status', 'active').order('name'),
    ]).then(([p, t]) => {
      if (p.data) setPlans(p.data)
      if (t.data) setTrainers(t.data)
    })
  }, [])

  const expiryDate = selectedPlan && joinDate
    ? new Date(new Date(joinDate).getTime() + selectedPlan.duration_days * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
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
    const { error } = await supabase.from('members').insert({
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      address: fd.get('address'),
      gender: fd.get('gender'),
      dob: fd.get('dob') || null,
      plan_id,
      trainer_id: (fd.get('trainer_id') as string) || null,
      join_date: fd.get('join_date') || new Date().toISOString().slice(0, 10),
      expiry_date,
      status: 'active',
    })
    setSubmitting(false)
    if (!error) router.push('/members')
    else alert(error.message)
  }

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>

      <PageHeader title="Add New Member" description="Fill in the member's details to register them at your gym." />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <CardContainer>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
              <input name="name" required placeholder="e.g. Ahmed Khan" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <input name="phone" type="tel" placeholder="+92 300 1234567" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input name="email" type="email" placeholder="member@example.com" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <input name="address" placeholder="House #, Street, Area, City" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <select name="gender" className={inputCls}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input name="dob" type="date" className={inputCls} />
              </div>
            </div>
          </div>
        </CardContainer>

        {/* Membership */}
        <CardContainer>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Membership Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
              <select
                name="plan_id"
                className={inputCls}
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
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Trainer (optional)</label>
              <select name="trainer_id" className={inputCls}>
                <option value="">— No trainer —</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Join Date</label>
                <input
                  name="join_date"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date (auto)</label>
                <input
                  type="date"
                  value={expiryDate ?? ''}
                  readOnly
                  className={`${inputCls} cursor-not-allowed bg-slate-50 dark:bg-slate-800/30`}
                />
                {expiryDate && (
                  <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    ✓ Auto-calculated from plan duration
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContainer>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/members">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Save Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
