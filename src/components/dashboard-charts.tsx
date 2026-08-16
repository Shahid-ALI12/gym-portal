'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/components/theme-provider'

interface Point {
  month: string
  revenue?: number
  profit?: number
  members?: number
}

interface TooltipEntry {
  color?: string
  stroke?: string
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
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || entry.stroke }}>
          {prefix}{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function RevenueAreaChart({ data }: { data: Point[] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip prefix="PKR " />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#rev)"
          name="Revenue"
          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MemberGrowthLineChart({ data }: { data: Point[] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="members"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
          name="Members"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
