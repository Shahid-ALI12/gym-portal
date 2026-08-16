-- ============================================================
-- Gym Portal — DISABLE RLS (Nuclear Option)
-- ============================================================
-- Prototype/dev ke liye RLS bilkul disable kar deta hai.
-- Phir INSERT/UPDATE/DELETE/SELECT sab bina kisi policy
-- check ke chal jayenge. Production mein wapis enable karke
-- proper auth-based policies lagani hongi.
-- ============================================================

ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE trainers DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Done! Ab koi RLS error nahi aayega.
