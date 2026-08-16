import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Super Admin Login — Gym Portal',
}

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 shadow-lg shadow-rose-500/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-400">Gym Subscription Control Center</p>
        </div>
        {children}
      </div>
    </div>
  )
}
