import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    supabaseUrl !== "your-supabase-url" &&
    !supabaseUrl.includes("your-");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <Sidebar />
          <div className="lg:pl-64">
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {isConfigured ? (
                <div className="animate-fade-in">{children}</div>
              ) : (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="max-w-lg overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-lg dark:border-amber-500/30 dark:bg-slate-900">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4">
                      <h1 className="text-lg font-bold text-white">
                        ⚙️ Supabase Setup Required
                      </h1>
                      <p className="text-sm text-amber-50">
                        Database is not configured yet. Follow these steps:
                      </p>
                    </div>
                    <div className="p-6 text-left text-sm text-slate-700 dark:text-slate-300">
                      <ol className="space-y-3">
                        <li className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">1</span>
                          <span>Create a Supabase project at <a href="https://supabase.com" className="font-medium text-indigo-600 underline dark:text-indigo-400" target="_blank" rel="noopener">supabase.com</a></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">2</span>
                          <span>Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">supabase/schema.sql</code> in Supabase SQL Editor</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">3</span>
                          <span>Copy Project URL & anon key from Settings → API</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">4</span>
                          <span>Add to Vercel Environment Variables:</span>
                        </li>
                      </ol>
                      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-green-400">{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...`}</pre>
                      <p className="mt-3 text-sm">5. Redeploy on Vercel</p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
