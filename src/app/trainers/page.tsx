import { Plus, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TrainersPage() {
  const supabase = await createClient()
  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, name, phone, specialization, salary, status')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trainers</h1>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-60"
        >
          <Plus className="h-4 w-4" /> Add Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(trainers ?? []).length === 0 && <p className="text-slate-400">No trainers yet.</p>}
        {(trainers ?? []).map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="text-sm text-slate-500">{t.specialization || 'Trainer'}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                  t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.status}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" /> {t.phone || '—'}
              </p>
              <p className="font-medium text-slate-900">Salary: {formatCurrency(t.salary ?? 0)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
