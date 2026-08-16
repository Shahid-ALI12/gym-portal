# 🏋️ Gym Portal

Gym Management Portal — Next.js 15 + Supabase + Tailwind + Vercel

## Features

- **Dashboard** — stats cards (members, revenue, profit), charts, recent payments
- **Members** — add/edit/delete members, assign plans & trainers
- **Plans** — membership plans management (Monthly, Quarterly, Half-Year, Yearly)
- **Payments** — fee collection, invoices, payment history
- **Trainers** — trainer management with specialization & salary
- **Products** — inventory (supplements, accessories), stock tracking
- **Sales/POS** — product sales with auto profit calculation
- **Expenses** — gym expenses tracking
- **Statistics** — revenue vs expenses charts, profit trends, member status
- **Settings** — gym info, currency, contact

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts |
| Icons | lucide-react |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase URL and anon key

# Run database schema
# Copy supabase/schema.sql into Supabase SQL Editor and run

# Start dev server
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste and run `supabase/schema.sql`
4. Copy your Project URL and anon key to `.env.local`

## License

MIT
