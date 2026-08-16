-- ============================================================
-- Gym Portal — COMPLETE SCHEMA SETUP (Fresh Project)
-- ============================================================
-- Naye Supabase project ke liye all-in-one script:
--   1. uuid-ossp extension enable
--   2. 8 tables create (plans, trainers, members, payments,
--      products, sales, expenses, settings)
--   3. Indexes
--   4. Seed data (4 default plans + gym settings)
--   5. RLS DISABLED (prototype ke liye easiest — no auth errors)
-- ============================================================
-- RUN: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- Step 1: Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Step 2: CREATE TABLES
-- ============================================================

-- 1. PLANS (Membership plans)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRAINERS
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  salary NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  gender TEXT DEFAULT 'male',
  dob DATE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  join_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'paid',
  invoice_no TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS (Inventory)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'supplement',
  cost_price NUMERIC(10,2) DEFAULT 0,
  sell_price NUMERIC(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SALES
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 1,
  total NUMERIC(10,2) NOT NULL,
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SETTINGS (Gym info)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  gym_name TEXT DEFAULT 'My Gym',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  currency TEXT DEFAULT 'PKR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Step 3: INDEXES (Performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_plan ON members(plan_id);
CREATE INDEX IF NOT EXISTS idx_members_trainer ON members(trainer_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- ============================================================
-- Step 4: SEED DATA
-- ============================================================
INSERT INTO plans (name, duration_days, price, description) VALUES
  ('Monthly',   30,  3000, '30 days membership'),
  ('Quarterly', 90,  8000, '90 days membership'),
  ('Half-Year', 180, 15000, '180 days membership'),
  ('Yearly',    365, 28000, '365 days membership')
ON CONFLICT DO NOTHING;

INSERT INTO settings (id, gym_name) VALUES (1, 'My Gym')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Step 5: RLS — DISABLED (prototype ke liye)
-- ============================================================
-- RLS disable kar rahe hain taake bina auth ke direct
-- INSERT/UPDATE/DELETE/SELECT sab chal jaye. Koi RLS
-- policy error nahi aayega. Production mein auth add karke
-- RLS enable karna aur auth.uid() based policies lagana.
-- ============================================================
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE trainers DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE! 
-- ============================================================
-- Ab tumhare Supabase project mein:
--   ✅ 8 tables ready
--   ✅ Indexes for performance
--   ✅ 4 default plans (Monthly/Quarterly/Half-Year/Yearly)
--   ✅ Default gym settings row
--   ✅ RLS disabled — no permission errors
--
-- Next: Update .env.local with new project URL + anon key
-- ============================================================
