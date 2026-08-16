'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Product } from '@/lib/types'
import {
  PageHeader,
  Button,
  Badge,
  CardContainer,
  TableWrapper,
  SectionTitle,
  EmptyState,
} from '@/components/ui/primitives'

interface RecentSale {
  id: string
  qty: number
  total: number
  sale_date: string
  product: { name: string }[] | null
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recent, setRecent] = useState<RecentSale[]>([])
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  async function refresh() {
    const supabase = createClient()
    const [p, s] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase
        .from('sales')
        .select('id, product_id, qty, total, sale_date, created_at, product:products(name)')
        .order('sale_date', { ascending: false })
        .limit(10),
    ])
    if (p.data) setProducts(p.data as Product[])
    if (s.data) setRecent(s.data as RecentSale[])
  }

  const selected = products.find((p) => p.id === productId)
  const total = selected ? Number(selected.sell_price) * qty : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || qty < 1) return
    setSubmitting(true)
    const supabase = createClient()

    // 1) Atomic stock check + decrement: only succeeds if current stock >= qty.
    //    .gte('stock', qty) makes the UPDATE conditional on sufficient stock,
    //    preventing overselling under concurrent requests.
    const { data: updated, error: stockError } = await supabase
      .from('products')
      .update({ stock: Math.max(0, selected.stock - qty) })
      .eq('id', selected.id)
      .gte('stock', qty)
      .select('stock')
      .single()

    if (stockError || !updated) {
      // Stock was insufficient OR race condition hit — refresh and notify
      setToast({ msg: 'Insufficient stock — please refresh and try again', type: 'error' })
      await refresh()
      setSubmitting(false)
      return
    }

    // 2) Insert the sale row now that stock has been decremented
    const { error: saleError } = await supabase.from('sales').insert({
      product_id: selected.id,
      qty,
      total,
      sale_date: new Date().toISOString().slice(0, 10),
    })

    if (!saleError) {
      setProductId('')
      setQty(1)
      await refresh()
      setToast({ msg: `Sale recorded — ${formatCurrency(total)}`, type: 'success' })
    } else {
      // Rollback: restore the stock we decremented above
      await supabase
        .from('products')
        .update({ stock: selected.stock })
        .eq('id', selected.id)
      setToast({ msg: saleError.message, type: 'error' })
    }
    setSubmitting(false)
  }

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500'

  // Stats
  const todaySales = recent.filter((s) => s.sale_date === new Date().toISOString().slice(0, 10))
  const todayTotal = todaySales.reduce((s, x) => s + Number(x.total), 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Sales / POS" description="Record new sales and view recent transactions" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 animate-fade-in rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      {/* Today's summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Today's Sales</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{todaySales.length}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Today's Revenue</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(todayTotal)}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Recent Records</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{recent.length}</p>
          </div>
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* POS Form */}
        <div className="lg:col-span-2">
          <CardContainer>
            <SectionTitle icon={ShoppingCart}>New Sale</SectionTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">— Select product —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock < 1}>
                      {p.name} — {formatCurrency(p.sell_price)} (stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className={inputCls}
                />
              </div>

              {/* Live total */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-slate-800 dark:from-indigo-500/5 dark:to-violet-500/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Unit Price</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selected?.sell_price ?? 0)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-slate-500">Quantity</span>
                  <span className="font-medium text-slate-900 dark:text-white">{qty}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-indigo-200/50 pt-2 dark:border-indigo-500/20">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Total</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button type="submit" disabled={submitting || !selected} className="w-full">
                {submitting ? 'Processing…' : 'Record Sale'}
              </Button>
            </form>
          </CardContainer>
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-3">
          <TableWrapper>
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Sales</h2>
            </div>
            {recent.length === 0 ? (
              <EmptyState title="No sales yet" description="Recorded sales will appear here." icon={Receipt} />
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recent.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Package className="h-4 w-4 text-slate-500" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{s.product?.[0]?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color="indigo">×{s.qty}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(s.total)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(s.sale_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableWrapper>
        </div>
      </div>
    </div>
  )
}
