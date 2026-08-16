import { Plus, Phone, Dumbbell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import {
  PageHeader,
  Button,
  Badge,
  CardContainer,
  EmptyState,
} from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

export default async function TrainersPage() {
  const supabase = await createClient()
  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, name, phone, specialization, salary, status')
    .order('created_at', { ascending: false })

  const colors = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-blue-500 to-cyan-500',
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Trainers" description={`${trainers?.length ?? 0} trainers on your team`}>
        <Button disabled>
          <Plus className="h-4 w-4" /> Add Trainer
        </Button>
      </PageHeader>

      {(trainers ?? []).length === 0 ? (
        <CardContainer>
          <EmptyState
            title="No trainers yet"
            description="Trainers you add will appear here as cards."
            icon={Dumbbell}
          />
        </CardContainer>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(trainers ?? []).map((t, idx) => (
            <CardContainer key={t.id} hover className="overflow-hidden p-0">
              {/* Gradient header */}
              <div className={`relative h-20 bg-gradient-to-r ${colors[idx % colors.length]}`}>
                <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white bg-white text-lg font-bold text-slate-700 shadow-lg dark:border-slate-900 dark:bg-slate-800 dark:text-white">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute right-3 top-3">
                  <Badge color={t.status === 'active' ? 'green' : 'slate'} className="bg-white/20 text-white backdrop-blur">
                    {t.status}
                  </Badge>
                </div>
              </div>

              <div className="px-5 pb-5 pt-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.specialization || 'Trainer'}</p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{t.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400">Monthly Salary</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(t.salary ?? 0)}</p>
                  </div>
                </div>
              </div>
            </CardContainer>
          ))}
        </div>
      )}
    </div>
  )
}
