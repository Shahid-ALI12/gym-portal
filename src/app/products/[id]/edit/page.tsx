'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useGymSession } from '@/lib/auth/use-gym-session'
import type { Product } from '@/lib/types'
import {
  PageHeader,
  Button,
  FormField,
  FormSection,
  FormActions,
  inputCls,
} from '@/components/ui/form'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { session } = useGymSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    const supabase = createClient()
    supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('gym_id', session.gymId)
      .single()
      .then(({ data, error }) => {
        if (data) setProduct(data as Product)
        else setError(error?.message ?? 'Product not found')
        setLoading(false)
      })
  }, [params.id, session])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({
        name: String(fd.get('name') ?? '').trim(),
        category: String(fd.get('category') ?? 'supplement'),
        cost_price: Number(fd.get('cost_price')) || 0,
        sell_price: Number(fd.get('sell_price')) || 0,
        stock: Number(fd.get('stock')) || 0,
      })
      .eq('id', params.id)
      .eq('gym_id', session!.gymId)
    setSubmitting(false)
    if (!error) router.push('/products')
    else setError(error.message)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Product not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <PageHeader title="Edit Product" description="Update the product details." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Package} title="Product Details">
          <FormField label="Product Name" required>
            <input name="name" required defaultValue={product.name} className={inputCls} />
          </FormField>

          <FormField label="Category" required>
            <select name="category" defaultValue={product.category} className={inputCls}>
              <option value="supplement">Supplement</option>
              <option value="accessory">Accessory</option>
              <option value="equipment">Equipment</option>
            </select>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Cost Price (PKR)" required>
              <input name="cost_price" type="number" min={0} step="any" required defaultValue={product.cost_price} className={inputCls} />
            </FormField>
            <FormField label="Sell Price (PKR)" required>
              <input name="sell_price" type="number" min={0} step="any" required defaultValue={product.sell_price} className={inputCls} />
            </FormField>
          </div>

          <FormField label="Stock" required hint="Adjust stock manually — sales will also decrement it">
            <input name="stock" type="number" min={0} required defaultValue={product.stock} className={inputCls} />
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
            {submitting ? 'Saving…' : 'Update Product'}
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
