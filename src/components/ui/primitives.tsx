import { cn } from '@/lib/utils'

/**
 * Page-level header with title, description and optional actions.
 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

/**
 * Primary brand button.
 */
export function Button({
  children,
  variant = 'brand',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'brand' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  }
  const variants = {
    brand:
      'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.98]',
    ghost:
      'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800/50',
    danger:
      'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98]',
  }
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Status / category pill.
 */
export function Badge({
  children,
  color = 'slate',
  className,
}: {
  children: React.ReactNode
  color?: 'slate' | 'green' | 'red' | 'amber' | 'indigo' | 'purple' | 'blue'
  className?: string
}) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300',
    green:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    amber:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    indigo:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    purple:
      'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * Standard card container used across pages.
 */
export function CardContainer({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60',
        hover &&
          'transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:hover:border-indigo-500/30',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Section title inside a card.
 */
export function SectionTitle({
  children,
  icon: Icon,
  action,
}: {
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
        {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
        {children}
      </h2>
      {action}
    </div>
  )
}

/**
 * Standard table wrapper with overflow scroll.
 */
export function TableWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60',
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

/**
 * Empty state placeholder.
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {title}
      </p>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  )
}
