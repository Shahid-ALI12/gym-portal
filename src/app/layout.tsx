import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { getSession } from "@/lib/auth/session";
import { SubscriptionGate } from "@/components/subscription-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym Portal — Management Suite",
  description: "Complete gym management portal — members, trainers, payments, inventory, sales and insights.",
};

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isConfigured =
    supabaseUrl &&
    supabaseUrl !== "your-supabase-url" &&
    !supabaseUrl.includes("your-");

  // If not logged in as a gym owner, show config screen (covers both
  // unconfigured and not-logged-in states)
  const showConfigScreen = !isConfigured || !session || session.role !== 'gym'

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          {showConfigScreen ? (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
              <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Gym Portal Access</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {!isConfigured
                    ? 'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
                    : 'You must sign in as a gym owner to access the portal. If you are the platform admin, use the admin login.'}
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                    Gym Owner Login
                  </a>
                  <a href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    Super Admin Login
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Sidebar gymName={session.gymName} gymEmail={session.email} />
              <div className="lg:pl-64">
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                  <SubscriptionGate gymId={session.gymId}>
                    <div className="animate-fade-in">{children}</div>
                  </SubscriptionGate>
                </main>
              </div>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
