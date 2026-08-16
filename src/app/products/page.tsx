import Link from 'next/link'
import { Plus, Package, AlertTriangle, TrendingUp, Pencil } from 'lucide-react'
import { getGymScopedClient } from '@/lib/auth/scoped'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/lib/types'
import {
  PageHeader,
  Button,
  Badge,
  TableWrapper,
  CardContainer,
  EmptyState,
} from '@/components/ui/primitives'
import { DeleteButton } from '@/components/ui/delete-button'

export const dynamic = 'force-dynamic'

const categoryColors: Record<string, 'indigo' | 'purple' | 'blue'> = {
  supplement: 'indigo',
  accessory: 'purple',
  equipment: 'blue',
}

export default async function ProductsPage() {
  const { supabase, gymId } = await getGymScopedClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, cost_price, sell_price, stock, created_at')
    .eq('gym_id', gymId)
    .order('name')

  const totalProducts = products?.length ?? 0
  const lowStockCount = (products ?? []).filter((p) => p.stock < 5).length
  const totalValue = (products ?? []).reduce((s, p) => s + Number(p.sell_price) * p.stock, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Products / Inventory" description={`${totalProducts} products in your inventory`}>
        <Link href="/products/add">
          <Button>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Products</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{totalProducts}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Low Stock Items</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{lowStockCount}</p>
          </div>
        </CardContainer>
        <CardContainer className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Inventory Value</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</p>
          </div>
        </CardContainer>
      </div>

      <TableWrapper>
        {(products ?? []).length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add products to start tracking inventory and sales."
            icon={Package}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Sell Price</th>
                <th className="px-4 py-3 font-semibold">Margin</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(products as Product[] | null ?? [])?.map((p) => {
                const margin = p.sell_price - p.cost_price
                const marginPct = p.cost_price > 0 ? Math.round((margin / p.cost_price) * 100) : 0
                const lowStock = p.stock < 5
                return (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Package className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={categoryColors[p.category] ?? 'slate'}>{p.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatCurrency(p.cost_price)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{formatCurrency(p.sell_price)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(margin)}</span>
                      <span className="ml-1 text-xs text-slate-400">({marginPct}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={lowStock ? 'red' : 'slate'}>
                        {p.stock} {lowStock ? '· Low' : 'in stock'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${p.id}/edit`}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton table="products" id={p.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </TableWrapper>
    </div>
  )
}
