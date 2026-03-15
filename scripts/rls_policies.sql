-- ============================================================
-- Ghar Ka Khana — RLS Policies
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── USERS TABLE ──────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_all_authenticated" ON public.users;

-- SELECT: users can read their own row; admins/cooks can read all (for order display)
-- SELECT: users can read their own row; admins can read all; other authenticated users can read basic info
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR auth.role() = 'authenticated'
  );

-- INSERT: only the authenticated user can insert their own row
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: only the authenticated user can update their own row
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ── KITCHENS TABLE ────────────────────────────────────────────
ALTER TABLE public.kitchens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kitchens_select_public" ON public.kitchens;
DROP POLICY IF EXISTS "kitchens_insert_cook" ON public.kitchens;
DROP POLICY IF EXISTS "kitchens_update_owner_or_admin" ON public.kitchens;

-- Anyone (including anon) can view approved kitchens
CREATE POLICY "kitchens_select_public" ON public.kitchens
  FOR SELECT USING (true);

-- Authenticated users can insert their own kitchen
CREATE POLICY "kitchens_insert_cook" ON public.kitchens
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owner can update their kitchen; admins can update any
CREATE POLICY "kitchens_update_owner_or_admin" ON public.kitchens
  FOR UPDATE USING (
    auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── CATEGORIES TABLE ──────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;

CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FOODS TABLE ───────────────────────────────────────────────
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "foods_select_all" ON public.foods;
DROP POLICY IF EXISTS "foods_insert_cook" ON public.foods;
DROP POLICY IF EXISTS "foods_update_cook_or_admin" ON public.foods;
DROP POLICY IF EXISTS "foods_delete_cook_or_admin" ON public.foods;

CREATE POLICY "foods_select_all" ON public.foods
  FOR SELECT USING (true);

CREATE POLICY "foods_insert_cook" ON public.foods
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.kitchens WHERE id = kitchen_id AND owner_id = auth.uid())
  );

CREATE POLICY "foods_update_cook_or_admin" ON public.foods
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.kitchens WHERE id = kitchen_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "foods_delete_cook_or_admin" ON public.foods
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.kitchens WHERE id = kitchen_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── ORDERS TABLE ──────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_customer" ON public.orders;
DROP POLICY IF EXISTS "orders_update_cook_or_admin" ON public.orders;

-- Customers see their own orders; cooks see orders for their kitchen; admins see all
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.kitchens WHERE id = kitchen_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "orders_insert_customer" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "orders_update_cook_or_admin" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.kitchens WHERE id = kitchen_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── ORDER_ITEMS TABLE ─────────────────────────────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_customer" ON public.order_items;

CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
      AND (
        o.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.kitchens k WHERE k.id = o.kitchen_id AND k.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
      )
    )
  );

CREATE POLICY "order_items_insert_customer" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

-- ── REVIEWS TABLE ─────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_customer" ON public.reviews;

CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_customer" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- ── ADMIN_LOGS TABLE ──────────────────────────────────────────
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_logs_select_admin" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_logs_insert_admin" ON public.admin_logs;

CREATE POLICY "admin_logs_select_admin" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_logs_insert_admin" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'cook'))
  );

-- ============================================================
-- DONE — All RLS policies applied
-- ============================================================

-- ============================================================
-- STORAGE POLICIES — food-images bucket
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop existing policies first (makes script idempotent / safe to re-run)
DROP POLICY IF EXISTS "storage_food_images_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_food_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_food_images_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_food_images_delete" ON storage.objects;

-- Allow anyone to read/view images (public bucket reads)
CREATE POLICY "storage_food_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

-- Allow any authenticated user to upload images
CREATE POLICY "storage_food_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

-- Only the uploader can update their own images
CREATE POLICY "storage_food_images_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'food-images' AND auth.uid() = owner);

-- Only the uploader can delete their own images
CREATE POLICY "storage_food_images_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'food-images' AND auth.uid() = owner);

-- ============================================================
-- IMPORTANT — after running this SQL you must also:
--   1. Go to Supabase Dashboard → Storage → food-images
--   2. Click "Edit bucket" → Enable "Public bucket"
--   This allows getPublicUrl() to return accessible URLs.
-- ============================================================
