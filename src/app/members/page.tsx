import Link from 'next/link'
import { Plus, Users, Phone, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  PageHeader,
  Button,
  Badge,
  TableWrapper,
  EmptyState,
} from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, 'green' | 'red' | 'slate'> = {
  active: 'green',
  expired: 'red',
  inactive: 'slate',
}

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, name, phone, join_date, expiry_date, status, plan:plans(name, price)')
    .order('created_at', { ascending: false })

  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-blue-500']

  return (
    <div className="space-y-6">
      <PageHeader title="Members" description={`${members?.length ?? 0} members registered at your gym`}>
        <Link href="/members/add">
          <Button>
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </Link>
      </PageHeader>

      <TableWrapper>
        {(members ?? []).length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Add your first member to get started."
            icon={Users}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Join Date</th>
                <th className="px-4 py-3 font-semibold">Expiry</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(members ?? []).map((m, idx) => {
                const plan = (m.plan as unknown as { name?: string; price?: number }[] | null)?.[0]
                return (
                  <tr
                    key={m.id}
                    className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${colors[idx % colors.length]}`}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-slate-400">ID: {m.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.phone ? (
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {m.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {plan ? (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{plan.name}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(plan.price ?? 0)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(m.join_date)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(m.expiry_date)}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusColors[m.status] ?? 'slate'}>{m.status}</Badge>
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
