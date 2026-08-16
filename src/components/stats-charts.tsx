'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/components/theme-provider'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface TooltipEntry {
  color?: string
  fill?: string
  value?: number | string
  name?: string
}

interface TooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  prefix?: string
}

function ChartTooltip({ active, payload, label, prefix = '' }: TooltipProps) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {label && <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {prefix}{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function RevenueExpenseBarChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number }[]
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} content={<ChartTooltip prefix="PKR " />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
        <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ProfitLineChart({ data }: { data: { month: string; profit: number }[] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip prefix="PKR " />} />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
          name="Profit"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MemberStatusPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
          style={{ fontSize: 12 }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function PaymentMethodBarChart({
  data,
}: {
  data: { method: string; total: number }[]
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="method" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} content={<ChartTooltip prefix="PKR " />} />
        <Bar dataKey="total" name="Collected" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={50} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export { COLORS }
