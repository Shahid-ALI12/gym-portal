import { createClient } from '@/lib/supabase/server'
import {
  RevenueExpenseBarChart,
  ProfitLineChart,
  MemberStatusPieChart,
  PaymentMethodBarChart,
} from '@/components/stats-charts'
import { formatCurrency, formatMonth } from '@/lib/utils'

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
  for (const p of payments ?? []) {
    const m = formatMonth(p.payment_date)
    const row = months.find((x) => x.month === m)
    if (row) row.revenue += Number(p.amount)
    const key = p.method ?? 'unknown'
    payByMethod[key] = (payByMethod[key] ?? 0) + Number(p.amount)
  }
  for (const e of expenses ?? []) {
    const row = months.find((x) => x.month === formatMonth(e.date))
    if (row) row.expenses += Number(e.amount)
  }
  for (const row of months) row.profit = row.revenue - row.expenses

  // Member status counts
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

  // Top-selling products (by qty)
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

  const card = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="mb-4 text-lg font-semibold">Revenue vs Expenses (6 months)</h2>
          <RevenueExpenseBarChart data={months} />
        </div>
        <div className={card}>
          <h2 className="mb-4 text-lg font-semibold">Profit Trend (6 months)</h2>
          <ProfitLineChart data={months} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="mb-4 text-lg font-semibold">Member Status</h2>
          {statusData.every((s) => s.value === 0) ? (
            <p className="py-16 text-center text-slate-400">No members</p>
          ) : (
            <MemberStatusPieChart data={statusData} />
          )}
        </div>
        <div className={card}>
          <h2 className="mb-4 text-lg font-semibold">Payment Methods</h2>
          {methodData.length === 0 ? (
            <p className="py-16 text-center text-slate-400">No payments collected</p>
          ) : (
            <PaymentMethodBarChart data={methodData} />
          )}
        </div>
      </div>

      <div className={card}>
        <h2 className="mb-4 text-lg font-semibold">Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="py-8 text-center text-slate-400">No sales recorded</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const max = topProducts[0].qty
              return (
                <div key={p.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">
                      {i + 1}. {p.name}
                    </span>
                    <span className="text-slate-500">{p.qty} sold</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-indigo-500"
                      style={{ width: `${max ? (p.qty / max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
