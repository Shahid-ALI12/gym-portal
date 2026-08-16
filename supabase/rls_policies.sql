-- ============================================================
-- Gym Portal — RLS Policies (Run this in Supabase SQL Editor)
-- ============================================================
-- Ye script sab tables pe permissive RLS policies lagati hai
-- taake anon key (browser client) bina auth ke CRUD kar sake.
-- Prototype ke liye theek hai; production mein auth add karke
-- policies ko auth.uid() based restrict karna hoga.
-- ============================================================

-- 1. PLANS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans_select" ON plans;
DROP POLICY IF EXISTS "plans_insert" ON plans;
DROP POLICY IF EXISTS "plans_update" ON plans;
DROP POLICY IF EXISTS "plans_delete" ON plans;
CREATE POLICY "plans_select" ON plans FOR SELECT USING (true);
CREATE POLICY "plans_insert" ON plans FOR INSERT WITH CHECK (true);
CREATE POLICY "plans_update" ON plans FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "plans_delete" ON plans FOR DELETE USING (true);

-- 2. TRAINERS
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trainers_select" ON trainers;
DROP POLICY IF EXISTS "trainers_insert" ON trainers;
DROP POLICY IF EXISTS "trainers_update" ON trainers;
DROP POLICY IF EXISTS "trainers_delete" ON trainers;
CREATE POLICY "trainers_select" ON trainers FOR SELECT USING (true);
CREATE POLICY "trainers_insert" ON trainers FOR INSERT WITH CHECK (true);
CREATE POLICY "trainers_update" ON trainers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "trainers_delete" ON trainers FOR DELETE USING (true);

-- 3. MEMBERS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members_select" ON members;
DROP POLICY IF EXISTS "members_insert" ON members;
DROP POLICY IF EXISTS "members_update" ON members;
DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_select" ON members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_update" ON members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "members_delete" ON members FOR DELETE USING (true);

-- 4. PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON payments;
DROP POLICY IF EXISTS "payments_insert" ON payments;
DROP POLICY IF EXISTS "payments_update" ON payments;
DROP POLICY IF EXISTS "payments_delete" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (true);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (true);

-- 5. PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- 6. SALES
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_select" ON sales;
DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sales_update" ON sales;
DROP POLICY IF EXISTS "sales_delete" ON sales;
CREATE POLICY "sales_select" ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "sales_update" ON sales FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "sales_delete" ON sales FOR DELETE USING (true);

-- 7. EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_update" ON expenses;
DROP POLICY IF EXISTS "expenses_delete" ON expenses;
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "expenses_update" ON expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "expenses_delete" ON expenses FOR DELETE USING (true);

-- 8. SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_select" ON settings;
DROP POLICY IF EXISTS "settings_insert" ON settings;
DROP POLICY IF EXISTS "settings_update" ON settings;
DROP POLICY IF EXISTS "settings_delete" ON settings;
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "settings_delete" ON settings FOR DELETE USING (true);
