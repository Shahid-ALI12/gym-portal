import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  color?: string
  subtitle?: string
  className?: string
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-600',
  green: 'bg-emerald-500/10 text-emerald-600',
  amber: 'bg-amber-500/10 text-amber-600',
  red: 'bg-rose-500/10 text-rose-600',
  purple: 'bg-violet-500/10 text-violet-600',
  indigo: 'bg-indigo-500/10 text-indigo-600',
  slate: 'bg-slate-500/10 text-slate-600',
}

/**
 * Reusable stat/info card with an icon badge.
 */
export function Card({ title, value, icon: Icon, color = 'blue', subtitle, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 truncate text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
              colorClasses[color] ?? colorClasses.blue
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Card
