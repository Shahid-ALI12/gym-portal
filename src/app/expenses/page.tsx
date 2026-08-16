import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, category, amount, date, description')
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-60"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {(expenses ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No expenses yet</td>
              </tr>
            )}
            {(expenses ?? []).map((e) => (
              <tr key={e.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-rose-600">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-3">{formatDate(e.date)}</td>
                <td className="px-4 py-3 text-slate-500">{e.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
