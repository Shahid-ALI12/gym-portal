// Helper utilities for the Gym Portal

/**
 * Merge Tailwind class names, ignoring falsy values.
 * Minimal cn() — no clsx/tailwind-merge dependency needed.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a number as currency. Defaults to PKR.
 */
export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

/**
 * Format an ISO/date string into a readable date, e.g. "16 Aug 2025".
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date as a short month label for charts, e.g. "Aug".
 */
export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { month: 'short' })
}
