import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
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
  title: "Gym Portal",
  description: "Gym Management Portal",
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
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {isConfigured ? (
              children
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                  <h1 className="mb-2 text-2xl font-bold text-amber-800">
                    ⚙️ Supabase Setup Required
                  </h1>
                  <p className="mb-4 text-amber-700">
                    Database is not configured yet. Follow these steps:
                  </p>
                  <div className="rounded-lg bg-white p-4 text-left text-sm text-slate-700">
                    <p className="mb-2 font-semibold">1. Create a Supabase project at <a href="https://supabase.com" className="text-blue-600 underline" target="_blank" rel="noopener">supabase.com</a></p>
                    <p className="mb-2 font-semibold">2. Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">supabase/schema.sql</code> in Supabase SQL Editor</p>
                    <p className="mb-2 font-semibold">3. Copy Project URL & anon key from Settings → API</p>
                    <p className="mb-2 font-semibold">4. Add to Vercel Environment Variables:</p>
                    <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-green-400">{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...`}</pre>
                    <p className="mt-2 font-semibold">5. Redeploy on Vercel</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </body>
    </html>
  );
}
