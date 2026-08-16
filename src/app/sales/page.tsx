'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Product } from '@/lib/types'

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

  useEffect(() => {
    refresh()
  }, [])

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

    const { error: saleError } = await supabase.from('sales').insert({
      product_id: selected.id,
      qty,
      total,
      sale_date: new Date().toISOString().slice(0, 10),
    })

    if (!saleError) {
      // Decrement product stock
      const newStock = Math.max(0, selected.stock - qty)
      await supabase.from('products').update({ stock: newStock }).eq('id', selected.id)
      setProductId('')
      setQty(1)
      await refresh()
    } else {
      alert(saleError.message)
    }
    setSubmitting(false)
  }

  const cls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales / POS</h1>

      {/* POS form */}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className={cls}
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
          <label className="mb-1 block text-sm font-medium">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className={cls}
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Unit Price</span>
            <span>{formatCurrency(selected?.sell_price ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Quantity</span>
            <span>{qty}</span>
          </div>
          <div className="mt-1 flex justify-between border-t pt-1 font-bold">
            <span>Total</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !selected}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Processing…' : 'Record Sale'}
        </button>
      </form>

      {/* Recent sales */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b px-4 py-3 text-lg font-semibold">Recent Sales</h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No sales yet</td>
              </tr>
            )}
            {recent.map((s) => (
              <tr key={s.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{s.product?.[0]?.name ?? '—'}</td>
                <td className="px-4 py-3">{s.qty}</td>
                <td className="px-4 py-3">{formatCurrency(s.total)}</td>
                <td className="px-4 py-3">{formatDate(s.sale_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
