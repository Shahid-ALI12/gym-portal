'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeleteButtonProps {
  table: string
  id: string
  redirectTo?: string
  variant?: 'icon' | 'button'
  label?: string
  className?: string
}

/**
 * Reusable delete button with confirmation modal.
 * Deletes a row from the given Supabase table by id.
 */
export function DeleteButton({
  table,
  id,
  redirectTo,
  variant = 'icon',
  label = 'Delete',
  className,
}: DeleteButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    setDeleting(false)
    if (error) {
      setError(error.message)
      return
    }
    setConfirming(false)
    if (redirectTo) {
      router.push(redirectTo)
    } else {
      router.refresh()
    }
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setConfirming(true)
          }}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {confirming && (
          <ConfirmModal
            title="Confirm Delete"
            message="Are you sure you want to delete this record? This action cannot be undone."
            deleting={deleting}
            error={error}
            onConfirm={handleDelete}
            onCancel={() => {
              setConfirming(false)
              setError(null)
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className={`inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-[0.98] ${className ?? ''}`}
      >
        <Trash2 className="h-4 w-4" /> {label}
      </button>
      {confirming && (
        <ConfirmModal
          title="Confirm Delete"
          message="Are you sure you want to delete this record? This action cannot be undone."
          deleting={deleting}
          error={error}
          onConfirm={handleDelete}
          onCancel={() => {
            setConfirming(false)
            setError(null)
          }}
        />
      )}
    </>
  )
}

function ConfirmModal({
  title,
  message,
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  deleting: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-fade-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15">
            <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
