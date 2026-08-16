import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import type { Plan } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase.from('plans').select('*').order('price')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plans</h1>
        <Link
          href="/plans"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-60 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(plans ?? []).length === 0 && (
          <p className="text-slate-400">No plans yet.</p>
        )}
        {(plans as Plan[] | null ?? [])?.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5" /> {p.duration_days} days
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-600">{formatCurrency(p.price)}</p>
            <p className="mt-2 text-sm text-slate-500">{p.description || 'No description'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
