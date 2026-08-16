'use client'

import { cn } from '@/lib/utils'

// Shared input class for all forms
export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500'

export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  )
}

export function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function FormActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-3">{children}</div>
}

export function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={cn(
        'fixed right-6 top-6 z-50 animate-fade-in rounded-xl border px-4 py-3 shadow-lg',
        type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
      )}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// Re-export server-compatible primitives so client forms can use them
export { PageHeader, Button } from '@/components/ui/primitives'
