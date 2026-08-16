import { BarChart3, DollarSign, Users, TrendingUp, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  RevenueExpenseBarChart,
  ProfitLineChart,
  MemberStatusPieChart,
  PaymentMethodBarChart,
} from '@/components/stats-charts'
import { formatCurrency, formatMonth } from '@/lib/utils'
import {
  PageHeader,
  CardContainer,
  SectionTitle,
} from '@/components/ui/primitives'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = await createClient()

  const now = new Date()
  const months: { month: string; revenue: number; expenses: number; profit: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: formatMonth(d), revenue: 0, expenses: 0, profit: 0 })
  }

  const [{ data: payments }, { data: expenses }] = await Promise.all([
    supabase.from('payments').select('amount, payment_date, method, status').eq('status', 'paid'),
    supabase.from('expenses').select('amount, date'),
  ])

  const payByMethod: Record<string, number> = {}
  let totalRevenue = 0
  for (const p of payments ?? []) {
    const m = formatMonth(p.payment_date)
    const row = months.find((x) => x.month === m)
    if (row) row.revenue += Number(p.amount)
    totalRevenue += Number(p.amount)
    const key = p.method ?? 'unknown'
    payByMethod[key] = (payByMethod[key] ?? 0) + Number(p.amount)
  }
  let totalExpenses = 0
  for (const e of expenses ?? []) {
    const row = months.find((x) => x.month === formatMonth(e.date))
    if (row) row.expenses += Number(e.amount)
    totalExpenses += Number(e.amount)
  }
  for (const row of months) row.profit = row.revenue - row.expenses

  const [{ count: active }, { count: expired }, { count: inactive }] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
  ])
  const statusData = [
    { name: 'Active', value: active ?? 0 },
    { name: 'Expired', value: expired ?? 0 },
    { name: 'Inactive', value: inactive ?? 0 },
  ]
  const totalMembers = (active ?? 0) + (expired ?? 0) + (inactive ?? 0)

  const { data: sales } = await supabase
    .from('sales')
    .select('qty, product:products(name)')
    .order('sale_date', { ascending: false })
    .limit(100)
  const prodCounts: Record<string, number> = {}
  for (const s of sales ?? []) {
    const name = (s.product as unknown as { name?: string }[] | null)?.[0]?.name ?? 'Unknown'
    prodCounts[name] = (prodCounts[name] ?? 0) + Number(s.qty)
  }
  const topProducts = Object.entries(prodCounts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const methodData = Object.entries(payByMethod)
    .filter(([, v]) => v > 0)
    .map(([method, total]) => ({ method: method.charAt(0).toUpperCase() + method.slice(1), total }))

  return (
    <div className="space-y-6">
      <PageHeader title="Statistics & Insights" description="Performance overview of your gym over the last 6 months" />

      {/* Highlight stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} color="green" subtitle="All-time collected" />
        <Card title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingUp} color="red" subtitle="All-time spent" />
        <Card title="Net Profit" value={formatCurrency(totalRevenue - totalExpenses)} icon={BarChart3} color={totalRevenue - totalExpenses >= 0 ? 'indigo' : 'red'} subtitle="Revenue − Expenses" />
        <Card title="Total Members" value={totalMembers} icon={Users} color="blue" subtitle={`${active ?? 0} active` } />
      </div>

      {/* Revenue vs Expenses + Profit */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardContainer>
          <SectionTitle icon={BarChart3}>Revenue vs Expenses (6 months)</SectionTitle>
          <RevenueExpenseBarChart data={months} />
        </CardContainer>
        <CardContainer>
          <SectionTitle icon={TrendingUp}>Profit Trend (6 months)</SectionTitle>
          <ProfitLineChart data={months} />
        </CardContainer>
      </div>

      {/* Member status + Payment methods */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardContainer>
          <SectionTitle icon={Users}>Member Status</SectionTitle>
          {statusData.every((s) => s.value === 0) ? (
            <div className="flex h-[260px] items-center justify-center text-slate-400">No members</div>
          ) : (
            <MemberStatusPieChart data={statusData} />
          )}
        </CardContainer>
        <CardContainer>
          <SectionTitle icon={DollarSign}>Payment Methods</SectionTitle>
          {methodData.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center text-slate-400">No payments collected</div>
          ) : (
            <PaymentMethodBarChart data={methodData} />
          )}
        </CardContainer>
      </div>

      {/* Top Products */}
      <CardContainer>
        <SectionTitle icon={Package}>Top Selling Products</SectionTitle>
        {topProducts.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-slate-400">No sales recorded</div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const max = topProducts[0].qty
              const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500']
              return (
                <div key={p.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs dark:bg-slate-800">
                        {i + 1}
                      </span>
                      {p.name}
                    </span>
                    <span className="text-slate-500">{p.qty} sold</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                      style={{ width: `${max ? (p.qty / max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContainer>
    </div>
  )
}
