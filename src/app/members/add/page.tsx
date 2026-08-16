'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Plan, Trainer } from '@/lib/types'

export default function AddMemberPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [submitting, setSubmitting] = useState(false)

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const plan_id = (fd.get('plan_id') as string) || null

    // Compute expiry from selected plan
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

  const cls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/members" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>
      <h1 className="text-2xl font-bold">Add Member</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input name="name" required className={cls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input name="phone" className={cls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" className={cls} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input name="address" className={cls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Gender</label>
            <select name="gender" className={cls}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date of Birth</label>
            <input name="dob" type="date" className={cls} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Plan</label>
          <select name="plan_id" className={cls}>
            <option value="">— Select plan —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.duration_days} days)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Trainer</label>
          <select name="trainer_id" className={cls}>
            <option value="">— No trainer —</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.specialization}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Join Date</label>
          <input name="join_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={cls} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save Member'}
        </button>
      </form>
    </div>
  )
}
