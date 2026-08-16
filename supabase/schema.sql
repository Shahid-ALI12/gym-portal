-- ============================================================
-- Gym Portal — Multi-Tenant SaaS Schema
-- ============================================================
-- Ye script NAYE Supabase project ke liye hai:
--   1. uuid-ossp extension
--   2. super_admins table (sirf tum)
--   3. gyms table (har gym ek row — owner login yahan se)
--   4. 8 tenant tables with gym_id (plans, trainers, etc.)
--   5. Indexes (including gym_id)
--   6. RLS DISABLED (prototype ke liye)
-- ============================================================
-- RUN: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Choose "Run without RLS" when prompted.
-- ============================================================

-- Step 1: Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Step 2: SUPER ADMINS (sirf tum — main admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Step 3: GYMS (har gym ek tenant — owner login yahan se)
-- ============================================================
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL UNIQUE,
  owner_password_hash TEXT NOT NULL,
  owner_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  -- Subscription control
  subscription_status TEXT DEFAULT 'trial',  -- trial | active | suspended | expired
  subscription_plan TEXT DEFAULT 'monthly',   -- monthly | quarterly | yearly
  subscription_expires DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Step 4: TENANT TABLES (sab mein gym_id)
-- ============================================================

-- 1. PLANS
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRAINERS
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
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
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
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
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'paid',
  invoice_no TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
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
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 1,
  total NUMERIC(10,2) NOT NULL,
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SETTINGS (per gym)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL UNIQUE REFERENCES gyms(id) ON DELETE CASCADE,
  gym_name TEXT DEFAULT 'My Gym',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  currency TEXT DEFAULT 'PKR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Step 5: INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gyms_email ON gyms(owner_email);
CREATE INDEX IF NOT EXISTS idx_gyms_status ON gyms(subscription_status);

CREATE INDEX IF NOT EXISTS idx_plans_gym ON plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_trainers_gym ON trainers(gym_id);

CREATE INDEX IF NOT EXISTS idx_members_gym ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_plan ON members(plan_id);
CREATE INDEX IF NOT EXISTS idx_members_trainer ON members(trainer_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

CREATE INDEX IF NOT EXISTS idx_payments_gym ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_products_gym ON products(gym_id);
CREATE INDEX IF NOT EXISTS idx_sales_gym ON sales(gym_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

CREATE INDEX IF NOT EXISTS idx_expenses_gym ON expenses(gym_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- ============================================================
-- Step 6: RLS — DISABLED (prototype ke liye)
-- ============================================================
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;
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
--   ✅ super_admins table (sirf tum)
--   ✅ gyms table (har gym ek tenant)
--   ✅ 8 tenant tables with gym_id
--   ✅ Indexes for performance
--   ✅ RLS disabled — no permission errors
--
-- Next steps:
--   1. App mein .env.local mein ADMIN_EMAIL, ADMIN_PASSWORD add karo
--   2. App mein admin signup route visit karke super admin banao
--      OR manually SQL se add karo (see create_admin.sql)
-- ============================================================
