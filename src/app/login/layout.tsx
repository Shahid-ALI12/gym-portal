import type { Metadata } from 'next'
import { Dumbbell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gym Owner Login — Gym Portal',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-lg shadow-indigo-500/30">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Gym Portal</h1>
          <p className="mt-1 text-sm text-slate-400">Management Suite</p>
        </div>
        {children}
      </div>
    </div>
  )
}
