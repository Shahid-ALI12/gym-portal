import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const badge: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-rose-100 text-rose-700',
  inactive: 'bg-slate-100 text-slate-600',
}

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, name, phone, join_date, expiry_date, status, plan:plans(name, price)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        <Link
          href="/members/add"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Member
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Join Date</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No members yet</td>
              </tr>
            )}
            {(members ?? []).map((m) => (
              <tr key={m.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.phone || '—'}</td>
                <td className="px-4 py-3">
                  {(() => { const plan = (m.plan as unknown as { name?: string; price?: number }[] | null)?.[0]; return plan ? `${plan.name} (${formatCurrency(plan.price ?? 0)})` : '—' })()}
                </td>
                <td className="px-4 py-3">{formatDate(m.join_date)}</td>
                <td className="px-4 py-3">{formatDate(m.expiry_date)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badge[m.status] ?? badge.inactive}`}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
