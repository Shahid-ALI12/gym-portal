import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo' | 'slate'
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const colorStyles: Record<
  string,
  { icon: string; accent: string; glow: string }
> = {
  blue: {
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    accent: 'from-blue-500/5 to-transparent',
    glow: 'group-hover:shadow-blue-500/20',
  },
  green: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accent: 'from-emerald-500/5 to-transparent',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    accent: 'from-amber-500/5 to-transparent',
    glow: 'group-hover:shadow-amber-500/20',
  },
  red: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    accent: 'from-rose-500/5 to-transparent',
    glow: 'group-hover:shadow-rose-500/20',
  },
  purple: {
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    accent: 'from-violet-500/5 to-transparent',
    glow: 'group-hover:shadow-violet-500/20',
  },
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    accent: 'from-indigo-500/5 to-transparent',
    glow: 'group-hover:shadow-indigo-500/20',
  },
  slate: {
    icon: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    accent: 'from-slate-500/5 to-transparent',
    glow: 'group-hover:shadow-slate-500/20',
  },
}

/**
 * Reusable stat card with icon badge, optional trend and gradient accent.
 */
export function Card({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend,
  className,
}: StatCardProps) {
  const styles = colorStyles[color] ?? colorStyles.blue
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60',
        styles.glow,
        className
      )}
    >
      {/* Gradient accent in top-right */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60',
          styles.accent
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold',
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
              styles.icon
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
