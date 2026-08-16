import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, cost_price, sell_price, stock, created_at')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products / Inventory</h1>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-60"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Cost Price</th>
              <th className="px-4 py-3 font-medium">Sell Price</th>
              <th className="px-4 py-3 font-medium">Margin</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No products yet</td>
              </tr>
            )}
            {(products as Product[] | null ?? [])?.map((p) => {
              const margin = p.sell_price - p.cost_price
              const marginPct = p.cost_price > 0 ? Math.round((margin / p.cost_price) * 100) : 0
              const lowStock = p.stock < 5
              return (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 capitalize">{p.category}</td>
                  <td className="px-4 py-3">{formatCurrency(p.cost_price)}</td>
                  <td className="px-4 py-3">{formatCurrency(p.sell_price)}</td>
                  <td className="px-4 py-3 text-emerald-700">
                    {formatCurrency(margin)} <span className="text-xs text-slate-400">({marginPct}%)</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        lowStock ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.stock} {lowStock ? '· Low' : 'in stock'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
