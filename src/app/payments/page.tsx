import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const statusBadge: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-rose-100 text-rose-700',
}

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, status, invoice_no, member:members(name)')
    .order('payment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-60"
        >
          <Plus className="h-4 w-4" /> Record Payment
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments yet</td>
              </tr>
            )}
            {(payments ?? []).map((p) => (
              <tr key={p.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{(p.member as unknown as { name?: string }[] | null)?.[0]?.name ?? '—'}</td>
                <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3">{formatDate(p.payment_date)}</td>
                <td className="px-4 py-3 capitalize">{p.method}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge[p.status] ?? statusBadge.pending}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.invoice_no ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
