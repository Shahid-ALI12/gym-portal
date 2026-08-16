'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function AddProductPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('products').insert({
      name: String(fd.get('name') ?? '').trim(),
      category: String(fd.get('category') ?? 'supplement'),
      cost_price: Number(fd.get('cost_price')) || 0,
      sell_price: Number(fd.get('sell_price')) || 0,
      stock: Number(fd.get('stock')) || 0,
    })
    setSubmitting(false)
    if (!error) router.push('/products')
    else setError(error.message)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <PageHeader title="Add New Product" description="Add a new product to your inventory." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Package} title="Product Details">
          <FormField label="Product Name" required>
            <input name="name" required placeholder="e.g. Whey Protein 1kg" className={inputCls} />
          </FormField>

          <FormField label="Category" required>
            <select name="category" defaultValue="supplement" className={inputCls}>
              <option value="supplement">Supplement</option>
              <option value="accessory">Accessory</option>
              <option value="equipment">Equipment</option>
            </select>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Cost Price (PKR)" required hint="What you paid to buy it">
              <input name="cost_price" type="number" min={0} step="any" required placeholder="e.g. 3000" className={inputCls} />
            </FormField>
            <FormField label="Sell Price (PKR)" required hint="What customers pay">
              <input name="sell_price" type="number" min={0} step="any" required placeholder="e.g. 4500" className={inputCls} />
            </FormField>
          </div>

          <FormField label="Initial Stock" required hint="Number of units currently in inventory">
            <input name="stock" type="number" min={0} required defaultValue={0} className={inputCls} />
          </FormField>
        </FormSection>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <FormActions>
          <Link href="/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Save Product'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
