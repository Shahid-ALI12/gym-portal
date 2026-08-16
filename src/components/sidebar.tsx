'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  Calendar,
  Menu,
  X,
  Dumbbell as Logo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-provider'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/members', label: 'Members', icon: Users },
      { href: '/plans', label: 'Plans', icon: Calendar },
      { href: '/trainers', label: 'Trainers', icon: Dumbbell },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/expenses', label: 'Expenses', icon: Receipt },
    ],
  },
  {
    label: 'Inventory & Sales',
    items: [
      { href: '/products', label: 'Products', icon: Package },
      { href: '/sales', label: 'Sales / POS', icon: ShoppingCart },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/stats', label: 'Statistics', icon: BarChart3 },
      { href: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
            {group.label}
          </p>
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform', !active && 'group-hover:scale-110')} />
                {label}
                {active && (
                  <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-6 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-lg shadow-indigo-500/30">
        <Logo className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-base font-bold leading-tight text-white">Gym Portal</p>
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">
          Management Suite
        </p>
      </div>
    </Link>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-slate-950 px-4 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
            <Logo className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold">Gym Portal</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 transition-colors hover:bg-white/10"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-white/5 bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="hidden lg:block">
          <BrandLogo />
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavItems onNavigate={() => setOpen(false)} />
        </div>

        {/* Footer / theme toggle */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
            <span className="text-xs text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
          <p className="mt-2 px-2 text-center text-[0.65rem] text-slate-600">
            © 2025 Gym Portal
          </p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
