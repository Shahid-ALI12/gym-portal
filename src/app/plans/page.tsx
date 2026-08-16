import Link from 'next/link'
import { Plus, Calendar, Check, Star, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import type { Plan } from '@/lib/types'
import {
  PageHeader,
  Button,
  CardContainer,
  EmptyState,
} from '@/components/ui/primitives'
import { DeleteButton } from '@/components/ui/delete-button'

export const dynamic = 'force-dynamic'

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase.from('plans').select('*').order('price')

  const colors = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Membership Plans" description={`${plans?.length ?? 0} plans available for members`}>
        <Link href="/plans/add">
          <Button>
            <Plus className="h-4 w-4" /> Add Plan
          </Button>
        </Link>
      </PageHeader>

      {(plans ?? []).length === 0 ? (
        <CardContainer>
          <EmptyState
            title="No plans yet"
            description="Add membership plans to offer them to your members."
            icon={Calendar}
          />
        </CardContainer>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(plans as Plan[] | null ?? [])?.map((p, idx) => {
            const isFeatured = idx === 1
            return (
              <CardContainer
                key={p.id}
                hover
                className={`relative overflow-hidden ${isFeatured ? 'ring-2 ring-indigo-500/40' : ''}`}
              >
                {isFeatured && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">
                    <Star className="h-3 w-3 fill-white" /> Popular
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
                  {!isFeatured && (
                    <Link
                      href={`/plans/${p.id}/edit`}
                      className="rounded-md bg-white/80 p-1.5 text-slate-500 backdrop-blur transition-colors hover:bg-white hover:text-indigo-600 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}
                  {isFeatured && (
                    <Link
                      href={`/plans/${p.id}/edit`}
                      className="rounded-md bg-white/80 p-1.5 text-slate-500 backdrop-blur transition-colors hover:bg-white hover:text-indigo-600 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}
                  <DeleteButton table="plans" id={p.id} />
                </div>

                {/* Gradient top accent */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[idx % colors.length]}`} />

                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="text-sm text-slate-500">one-time</span>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {p.duration_days} days access
                  </div>

                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {p.description || 'No description provided.'}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500" /> Full gym access
                      </li>
                      <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500" /> {p.duration_days} days validity
                      </li>
                      <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500" /> Locker access
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContainer>
            )
          })}
        </div>
      )}
    </div>
  )
}
