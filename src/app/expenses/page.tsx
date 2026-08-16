import Link from 'next/link'
import { Plus, Receipt, TrendingDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  PageHeader,
  Button,
  Badge,
  TableWrapper,
  CardContainer,
  EmptyState,
} from '@/components/ui/primitives'
import { DeleteButton } from '@/components/ui/delete-button'

export const dynamic = 'force-dynamic'

const categoryColors: Record<string, 'red' | 'amber' | 'indigo' | 'purple' | 'slate'> = {
  rent: 'red',
  salary: 'amber',
  utilities: 'indigo',
  equipment: 'purple',
  other: 'slate',
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, category, amount, date, description')
    .order('date', { ascending: false })

  const monthStart = new Date()
  monthStart.setDate(1)
  const ms = monthStart.toISOString()
  const monthTotal = (expenses ?? [])
    .filter((e) => new Date(e.date) >= new Date(ms))
    .reduce((s, e) => s + Number(e.amount), 0)
  const total = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0)

  const byCategory: Record<string, number> = {}
  for (const e of expenses ?? []) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount)
  }
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description={`${expenses?.length ?? 0} expense records`}>
        <Link href="/expenses/add">
          <Button>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </Link>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">This Month</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(monthTotal)}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">All-time Total</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Top Category</p>
            <p className="text-lg font-bold capitalize text-slate-900 dark:text-white">
              {topCategory ? topCategory[0] : '—'}
            </p>
          </div>
        </CardContainer>
      </div>

      <TableWrapper>
        {(expenses ?? []).length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Recorded expenses will appear here."
            icon={Receipt}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(expenses ?? []).map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <Badge color={categoryColors[e.category] ?? 'slate'}>{e.category}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
                    −{formatCurrency(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {e.description || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DeleteButton table="expenses" id={e.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrapper>
    </div>
  )
}
