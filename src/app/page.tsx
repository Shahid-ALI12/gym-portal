import { Users, UserCheck, Wallet, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { RevenueAreaChart, MemberGrowthLineChart } from '@/components/dashboard-charts'
import { formatCurrency, formatMonth, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function monthlySeries() {
  const now = new Date()
  const months: { month: string; revenue: number; profit: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: formatMonth(d), revenue: 0, profit: 0 })
  }
  return months
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Counts
  const [{ count: totalMembers }, { count: activeMembers }] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  // Current month boundaries
  const monthStart = new Date()
  monthStart.setDate(1)
  const ms = monthStart.toISOString()

  // Payments this month (revenue) + expenses this month
  const [{ data: monthPayments }, { data: monthExpenses }] = await Promise.all([
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('payment_date', ms),
    supabase.from('expenses').select('amount').gte('date', ms),
  ])

  const monthlyRevenue = (monthPayments ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const monthlyExpense = (monthExpenses ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const monthlyProfit = monthlyRevenue - monthlyExpense

  // Recent payments (last 5) with member
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, status, invoice_no, member:members(name)')
    .order('payment_date', { ascending: false })
    .limit(5)

  // Members expiring in next 7 days
  const in7 = new Date()
  in7.setDate(in7.getDate() + 7)
  const { data: expiringSoon } = await supabase
    .from('members')
    .select('id, name, phone, expiry_date, plan:plans(name)')
    .lte('expiry_date', in7.toISOString())
    .gte('expiry_date', monthStart.toISOString())
    .limit(5)

  // Build revenue monthly series from payments
  const series = await monthlySeries()
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount, payment_date, status')
    .eq('status', 'paid')

  const { data: allExpenses } = await supabase.from('expenses').select('amount, date')

  for (const p of allPayments ?? []) {
    const row = series.find((s) => s.month === formatMonth(p.payment_date))
    if (row) row.revenue += Number(p.amount)
  }
  const expByMonth: Record<string, number> = {}
  for (const e of allExpenses ?? []) {
    const m = formatMonth(e.date)
    expByMonth[m] = (expByMonth[m] ?? 0) + Number(e.amount)
  }
  for (const row of series) row.profit = row.revenue - (expByMonth[row.month] ?? 0)

  // Member growth (count created_at per month)
  const { data: allMembers } = await supabase.from('members').select('created_at')
  const growthSeries = series.map((s) => ({ month: s.month, members: 0 }))
  for (const m of allMembers ?? []) {
    const mo = formatMonth(m.created_at)
    const row = growthSeries.find((g) => g.month === mo)
    if (row) row.members += 1
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Members" value={totalMembers ?? 0} icon={Users} color="blue" />
        <Card title="Active Members" value={activeMembers ?? 0} icon={UserCheck} color="green" />
        <Card
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon={Wallet}
          color="purple"
        />
        <Card
          title="Monthly Profit"
          value={formatCurrency(monthlyProfit)}
          icon={TrendingUp}
          color={monthlyProfit >= 0 ? 'indigo' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Revenue — Last 6 Months</h2>
          <RevenueAreaChart data={series} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Member Growth</h2>
          <MemberGrowthLineChart data={growthSeries} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent payments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2 font-medium">Member</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {(recentPayments ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">No payments yet</td>
                  </tr>
                )}
                {(recentPayments ?? []).map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2.5">{(p.member as unknown as { name?: string }[] | null)?.[0]?.name ?? '—'}</td>
                    <td className="py-2.5">{formatCurrency(p.amount)}</td>
                    <td className="py-2.5">{formatDate(p.payment_date)}</td>
                    <td className="py-2.5 capitalize">{p.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring soon */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Expiring Soon (7 days)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2 font-medium">Member</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {(expiringSoon ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">None expiring</td>
                  </tr>
                )}
                {(expiringSoon ?? []).map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2.5">{m.name}</td>
                    <td className="py-2.5">{(m.plan as unknown as { name?: string }[] | null)?.[0]?.name ?? '—'}</td>
                    <td className="py-2.5">{formatDate(m.expiry_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
