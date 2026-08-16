import { Plus, CreditCard, Wallet } from 'lucide-react'
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

export const dynamic = 'force-dynamic'

const statusColors: Record<string, 'green' | 'amber' | 'red'> = {
  paid: 'green',
  pending: 'amber',
  refunded: 'red',
}

const methodIcons: Record<string, string> = {
  cash: 'bg-emerald-500',
  card: 'bg-indigo-500',
  online: 'bg-violet-500',
  upi: 'bg-amber-500',
}

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, status, invoice_no, member:members(name)')
    .order('payment_date', { ascending: false })

  // Summary stats
  const total = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const paidCount = (payments ?? []).filter((p) => p.status === 'paid').length
  const pendingCount = (payments ?? []).filter((p) => p.status === 'pending').length

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description={`${payments?.length ?? 0} payment records`}>
        <Button disabled>
          <Plus className="h-4 w-4" /> Record Payment
        </Button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Collected</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Paid</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{paidCount}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{pendingCount}</p>
          </div>
        </CardContainer>
      </div>

      <TableWrapper>
        {(payments ?? []).length === 0 ? (
          <EmptyState
            title="No payments yet"
            description="Recorded payments will appear here."
            icon={CreditCard}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(payments ?? []).map((p) => {
                const memberName = (p.member as unknown as { name?: string }[] | null)?.[0]?.name ?? '—'
                return (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${methodIcons[p.method] ?? 'bg-slate-500'}`}>
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{memberName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{p.method}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusColors[p.status] ?? 'slate'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{p.invoice_no ?? '—'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </TableWrapper>
    </div>
  )
}
