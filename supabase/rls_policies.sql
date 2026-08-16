-- ============================================================
-- Gym Portal — Safe All-in-One Setup Script
-- ============================================================
-- Ye script SELF-CONTAINED hai:
--   1. Pehle tables create karta hai (agar nahi hain to)
--   2. Phir RLS policies lagata hai
--   3. Koi bhi order mein run karo, kabhi fail nahi hoga
-- ============================================================

-- Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CREATE TABLES (IF NOT EXISTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  salary NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'supplement',
  cost_price NUMERIC(10,2) DEFAULT 0,
  sell_price NUMERIC(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 1,
  total NUMERIC(10,2) NOT NULL,
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- 2. SEED DATA
-- ============================================================
INSERT INTO plans (name, duration_days, price, description) VALUES
  ('Monthly',  30,  3000, '30 days membership'),
  ('Quarterly', 90,  8000, '90 days membership'),
  ('Half-Year', 180, 15000, '180 days membership'),
  ('Yearly',   365, 28000, '365 days membership')
ON CONFLICT DO NOTHING;

INSERT INTO settings (id, gym_name) VALUES (1, 'My Gym')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. RLS POLICIES (safe — DROP IF EXISTS pehle)
-- ============================================================

-- PLANS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans_select" ON plans;
DROP POLICY IF EXISTS "plans_insert" ON plans;
DROP POLICY IF EXISTS "plans_update" ON plans;
DROP POLICY IF EXISTS "plans_delete" ON plans;
CREATE POLICY "plans_select" ON plans FOR SELECT USING (true);
CREATE POLICY "plans_insert" ON plans FOR INSERT WITH CHECK (true);
CREATE POLICY "plans_update" ON plans FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "plans_delete" ON plans FOR DELETE USING (true);

-- TRAINERS
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trainers_select" ON trainers;
DROP POLICY IF EXISTS "trainers_insert" ON trainers;
DROP POLICY IF EXISTS "trainers_update" ON trainers;
DROP POLICY IF EXISTS "trainers_delete" ON trainers;
CREATE POLICY "trainers_select" ON trainers FOR SELECT USING (true);
CREATE POLICY "trainers_insert" ON trainers FOR INSERT WITH CHECK (true);
CREATE POLICY "trainers_update" ON trainers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "trainers_delete" ON trainers FOR DELETE USING (true);

-- MEMBERS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members_select" ON members;
DROP POLICY IF EXISTS "members_insert" ON members;
DROP POLICY IF EXISTS "members_update" ON members;
DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_select" ON members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_update" ON members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "members_delete" ON members FOR DELETE USING (true);

-- PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON payments;
DROP POLICY IF EXISTS "payments_insert" ON payments;
DROP POLICY IF EXISTS "payments_update" ON payments;
DROP POLICY IF EXISTS "payments_delete" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (true);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (true);

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- SALES
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_select" ON sales;
DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sales_update" ON sales;
DROP POLICY IF EXISTS "sales_delete" ON sales;
CREATE POLICY "sales_select" ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "sales_update" ON sales FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "sales_delete" ON sales FOR DELETE USING (true);

-- EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_update" ON expenses;
DROP POLICY IF EXISTS "expenses_delete" ON expenses;
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "expenses_update" ON expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "expenses_delete" ON expenses FOR DELETE USING (true);

-- SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_select" ON settings;
DROP POLICY IF EXISTS "settings_insert" ON settings;
DROP POLICY IF EXISTS "settings_update" ON settings;
DROP POLICY IF EXISTS "settings_delete" ON settings;
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "settings_delete" ON settings FOR DELETE USING (true);
