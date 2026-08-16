import {
  Users,
  UserCheck,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  CalendarClock,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { getGymScopedClient } from '@/lib/auth/scoped'
import { Card } from '@/components/ui/card'
import {
  PageHeader,
  CardContainer,
  SectionTitle,
  EmptyState,
} from '@/components/ui/primitives'
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
  const { supabase, gymId } = await getGymScopedClient()

  // Counts
  const [{ count: totalMembers }, { count: activeMembers }] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'active'),
  ])

  // Current month boundaries
  const monthStart = new Date()
  monthStart.setDate(1)
  const ms = monthStart.toISOString()

  const [{ data: monthPayments }, { data: monthExpenses }] = await Promise.all([
    supabase
      .from('payments')
      .select('amount')
      .eq('gym_id', gymId)
      .eq('status', 'paid')
      .gte('payment_date', ms),
    supabase.from('expenses').select('amount').eq('gym_id', gymId).gte('date', ms),
  ])

  const monthlyRevenue = (monthPayments ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const monthlyExpense = (monthExpenses ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const monthlyProfit = monthlyRevenue - monthlyExpense

  const { data: recentPayments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, status, invoice_no, member:members(name)')
    .eq('gym_id', gymId)
    .order('payment_date', { ascending: false })
    .limit(5)

  const in7 = new Date()
  in7.setDate(in7.getDate() + 7)
  const { data: expiringSoon } = await supabase
    .from('members')
    .select('id, name, phone, expiry_date, plan:plans(name)')
    .eq('gym_id', gymId)
    .lte('expiry_date', in7.toISOString())
    .gte('expiry_date', monthStart.toISOString())
    .limit(5)

  const series = await monthlySeries()
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount, payment_date, status')
    .eq('gym_id', gymId)
    .eq('status', 'paid')

  const { data: allExpenses } = await supabase.from('expenses').select('amount, date').eq('gym_id', gymId)

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

  const { data: allMembers } = await supabase.from('members').select('created_at').eq('gym_id', gymId)
  const growthSeries = series.map((s) => ({ month: s.month, members: 0 }))
  for (const m of allMembers ?? []) {
    const mo = formatMonth(m.created_at)
    const row = growthSeries.find((g) => g.month === mo)
    if (row) row.members += 1
  }

  const methodColors: Record<string, string> = {
    cash: 'bg-emerald-500',
    card: 'bg-indigo-500',
    online: 'bg-violet-500',
    upi: 'bg-amber-500',
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back — here's what's happening at your gym today.`}
      >
        <Link
          href="/members/add"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30"
        >
          <Sparkles className="h-4 w-4" /> Quick Add Member
        </Link>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Members" value={totalMembers ?? 0} icon={Users} color="blue" subtitle="All-time registered" />
        <Card title="Active Members" value={activeMembers ?? 0} icon={UserCheck} color="green" subtitle="Currently enrolled" />
        <Card
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon={Wallet}
          color="purple"
          subtitle="This month so far"
        />
        <Card
          title="Monthly Profit"
          value={formatCurrency(monthlyProfit)}
          icon={TrendingUp}
          color={monthlyProfit >= 0 ? 'indigo' : 'red'}
          subtitle={monthlyProfit >= 0 ? 'Net positive' : 'Net loss'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardContainer>
          <SectionTitle>Revenue — Last 6 Months</SectionTitle>
          <RevenueAreaChart data={series} />
        </CardContainer>
        <CardContainer>
          <SectionTitle>Member Growth</SectionTitle>
          <MemberGrowthLineChart data={growthSeries} />
        </CardContainer>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent payments */}
        <CardContainer>
          <SectionTitle
            action={
              <Link
                href="/payments"
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            Recent Payments
          </SectionTitle>
          {(recentPayments ?? []).length === 0 ? (
            <EmptyState title="No payments yet" description="Payments will appear here once recorded." icon={Wallet} />
          ) : (
            <div className="space-y-2">
              {(recentPayments ?? []).map((p) => {
                const memberName = (p.member as unknown as { name?: string }[] | null)?.[0]?.name ?? '—'
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-colors hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${methodColors[p.method] ?? 'bg-slate-500'}`}>
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{memberName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(p.payment_date)} · <span className="capitalize">{p.method}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(p.amount)}</p>
                      <span className={`text-[0.65rem] font-semibold uppercase ${p.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : p.status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContainer>

        {/* Expiring soon */}
        <CardContainer>
          <SectionTitle
            action={
              <Link
                href="/members"
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            Expiring Soon (7 days)
          </SectionTitle>
          {(expiringSoon ?? []).length === 0 ? (
            <EmptyState title="None expiring" description="No memberships expiring this week." icon={CalendarClock} />
          ) : (
            <div className="space-y-2">
              {(expiringSoon ?? []).map((m) => {
                const planName = (m.plan as unknown as { name?: string }[] | null)?.[0]?.name ?? '—'
                const expiry = new Date(m.expiry_date)
                const today = new Date()
                const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-amber-200/50 bg-amber-50/50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{planName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        {daysLeft}d left
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(m.expiry_date)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContainer>
      </div>
    </div>
  )
}
