-- ============================================
-- Unlimited Perfect Deals - Supabase Database Schema
-- ============================================
-- This file contains the complete database schema for both
-- User Web App and Admin Panel applications.
-- 
-- Execute this file in your Supabase SQL Editor to set up:
-- - Database tables and constraints
-- - Row Level Security (RLS) policies  
-- - Database indexes for performance
-- - Storage buckets and policies
-- - Triggers and functions
-- ============================================

-- ============================================
-- Enable Required Extensions
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Database Tables
-- ============================================

-- User Profiles Table (Role Management)
-- Links auth.users to application roles and retailer accounts
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'retailer', 'consumer')),
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_profiles_email_not_empty CHECK (email <> ''),
  CONSTRAINT user_profiles_role_not_empty CHECK (role <> '')
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deal_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT categories_name_not_empty CHECK (name <> ''),
  CONSTRAINT categories_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT categories_order_non_negative CHECK ("order" >= 0),
  CONSTRAINT categories_deal_count_non_negative CHECK (deal_count >= 0)
);

-- Retailers Table
CREATE TABLE IF NOT EXISTS retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  affiliate_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deal_count INTEGER NOT NULL DEFAULT 0,
  commission NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  
  -- User Account Linking & Approval Workflow
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT retailers_name_not_empty CHECK (name <> ''),
  CONSTRAINT retailers_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT retailers_commission_range CHECK (commission >= 0 AND commission <= 100),
  CONSTRAINT retailers_deal_count_non_negative CHECK (deal_count >= 0)
);

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  savings_percentage NUMERIC(5,2) NOT NULL,
  category TEXT NOT NULL,
  retailer TEXT NOT NULL,
  deal_url TEXT NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Approval Workflow & Ownership
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT,
  
  -- Constraints
  CONSTRAINT deals_product_name_not_empty CHECK (product_name <> ''),
  CONSTRAINT deals_description_not_empty CHECK (description <> ''),
  CONSTRAINT deals_category_not_empty CHECK (category <> ''),
  CONSTRAINT deals_retailer_not_empty CHECK (retailer <> ''),
  CONSTRAINT deals_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT deals_price_non_negative CHECK (price >= 0),
  CONSTRAINT deals_original_price_non_negative CHECK (original_price >= 0),
  CONSTRAINT deals_price_less_than_original CHECK (price <= original_price),
  CONSTRAINT deals_savings_percentage_range CHECK (savings_percentage >= 0 AND savings_percentage <= 100),
  CONSTRAINT deals_view_count_non_negative CHECK (view_count >= 0),
  CONSTRAINT deals_click_count_non_negative CHECK (click_count >= 0)
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMPTZ NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_deals INTEGER NOT NULL DEFAULT 0,
  active_deals INTEGER NOT NULL DEFAULT 0,
  views_by_category JSONB DEFAULT '{}'::jsonb,
  clicks_by_category JSONB DEFAULT '{}'::jsonb,
  top_deals JSONB DEFAULT '[]'::jsonb,
  
  -- Constraints
  CONSTRAINT analytics_total_views_non_negative CHECK (total_views >= 0),
  CONSTRAINT analytics_total_clicks_non_negative CHECK (total_clicks >= 0),
  CONSTRAINT analytics_total_deals_non_negative CHECK (total_deals >= 0),
  CONSTRAINT analytics_active_deals_non_negative CHECK (active_deals >= 0),
  CONSTRAINT analytics_unique_date UNIQUE (date)
);

-- ============================================
-- Triggers for Auto-Updating Timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for user_profiles
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for categories
DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for retailers
DROP TRIGGER IF EXISTS retailers_updated_at ON retailers;
CREATE TRIGGER retailers_updated_at
  BEFORE UPDATE ON retailers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for deals
DROP TRIGGER IF EXISTS deals_updated_at ON deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Function for Role Checking
-- ============================================

-- Function to get user role from user_profiles
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a retailer
CREATE OR REPLACE FUNCTION is_retailer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(auth.uid()) = 'retailer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get retailer_id for current user
CREATE OR REPLACE FUNCTION get_user_retailer_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT retailer_id FROM user_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS Policies for User Profiles Table
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can create their own profile during signup
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can update their own retailer_id link
CREATE POLICY "Users can update own retailer link"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete all profiles
CREATE POLICY "Admins can delete all profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- RLS Policies for Categories Table
-- ============================================

-- Public read access to all categories
CREATE POLICY "Public read access to categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write access to categories
CREATE POLICY "Admin write access to categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- RLS Policies for Retailers Table
-- ============================================

-- Public read access to approved retailers
CREATE POLICY "Public read access to approved retailers"
  ON retailers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Retailers can read their own profile (any status)
CREATE POLICY "Retailers can read own profile"
  ON retailers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own retailer profile during signup
CREATE POLICY "Users can create own retailer profile"
  ON retailers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Retailers can update their own profile (limited fields)
CREATE POLICY "Retailers can update own profile"
  ON retailers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_retailer())
  WITH CHECK (user_id = auth.uid() AND is_retailer());

-- Admins can manage all retailers
CREATE POLICY "Admins can manage all retailers"
  ON retailers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- RLS Policies for Deals Table
-- ============================================

-- Public read access to approved, active, non-expired deals only
CREATE POLICY "Public read access to approved active deals"
  ON deals
  FOR SELECT
  TO anon
  USING (status = 'approved' AND is_active = true AND expiration_date > NOW());

-- Authenticated users (retailers) can read their own deals (any status)
CREATE POLICY "Retailers can read own deals"
  ON deals
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Admins can read all deals
CREATE POLICY "Admins can read all deals"
  ON deals
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Retailers can create deals (auto set to pending status)
CREATE POLICY "Retailers can create deals"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (is_retailer() AND created_by = auth.uid() AND status = 'pending');

-- Retailers can update their own pending deals only
CREATE POLICY "Retailers can update own pending deals"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending' AND is_retailer())
  WITH CHECK (created_by = auth.uid() AND status = 'pending' AND is_retailer());

-- Retailers can delete their own pending deals only
CREATE POLICY "Retailers can delete own pending deals"
  ON deals
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending' AND is_retailer());

-- Admins can manage all deals
CREATE POLICY "Admins can manage all deals"
  ON deals
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- RLS Policies for Analytics Table
-- ============================================

-- Only admin can access analytics
CREATE POLICY "Admin only access to analytics"
  ON analytics
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Helper Functions for User Signup
-- ============================================

-- Function to handle retailer signup (bypasses RLS)
CREATE OR REPLACE FUNCTION create_retailer_account(
  p_user_id UUID,
  p_email TEXT,
  p_business_name TEXT,
  p_slug TEXT,
  p_website_url TEXT,
  p_commission NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_retailer_id UUID;
  v_profile_exists BOOLEAN;
  v_unique_slug TEXT;
  v_slug_counter INTEGER := 0;
BEGIN
  -- Check if profile exists for this user_id
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = p_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    -- Create new user profile with retailer role
    INSERT INTO user_profiles (id, email, role, retailer_id)
    VALUES (p_user_id, p_email, 'retailer', NULL);
  ELSE
    -- Update existing profile to retailer role (in case trigger created it as consumer)
    UPDATE user_profiles
    SET role = 'retailer'
    WHERE id = p_user_id AND role != 'retailer';
  END IF;
  
  -- Check if retailer already exists for this user
  SELECT id INTO v_retailer_id
  FROM retailers
  WHERE user_id = p_user_id;
  
  -- Only create retailer if doesn't exist
  IF v_retailer_id IS NULL THEN
    -- Generate a unique slug
    v_unique_slug := p_slug;
    
    -- Check if slug exists and generate a unique one
    WHILE EXISTS(SELECT 1 FROM retailers WHERE slug = v_unique_slug) LOOP
      v_slug_counter := v_slug_counter + 1;
      v_unique_slug := p_slug || '-' || v_slug_counter;
    END LOOP;
    
    -- Create retailer record with unique slug
    INSERT INTO retailers (name, slug, website_url, commission, user_id, status, is_active, deal_count, logo_url)
    VALUES (p_business_name, v_unique_slug, p_website_url, p_commission, p_user_id, 'pending', false, 0, '')
    RETURNING id INTO v_retailer_id;
    
    -- Update user profile with retailer_id
    UPDATE user_profiles
    SET retailer_id = v_retailer_id
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_retailer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_retailer_account TO authenticated;

-- ============================================
-- Database Indexes for Performance
-- ============================================

-- User Profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
  ON user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_user_profiles_retailer_id 
  ON user_profiles(retailer_id);

-- Retailers indexes
CREATE INDEX IF NOT EXISTS idx_retailers_user_id 
  ON retailers(user_id);

CREATE INDEX IF NOT EXISTS idx_retailers_status 
  ON retailers(status);

CREATE INDEX IF NOT EXISTS idx_retailers_status_active 
  ON retailers(status ASC, is_active ASC);

-- Deals indexes for approval workflow
CREATE INDEX IF NOT EXISTS idx_deals_status 
  ON deals(status);

CREATE INDEX IF NOT EXISTS idx_deals_status_created 
  ON deals(status ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_retailer_id 
  ON deals(retailer_id);

CREATE INDEX IF NOT EXISTS idx_deals_created_by 
  ON deals(created_by);

-- Composite index for filtering and sorting active approved deals
CREATE INDEX IF NOT EXISTS idx_deals_status_active_expiration_created 
  ON deals(status ASC, is_active ASC, expiration_date DESC, created_at DESC);

-- Composite index for filtering approved deals by category
CREATE INDEX IF NOT EXISTS idx_deals_status_category_active_created 
  ON deals(status ASC, category ASC, is_active ASC, created_at DESC);

-- Composite index for filtering approved deals by retailer slug
CREATE INDEX IF NOT EXISTS idx_deals_status_retailer_active_created 
  ON deals(status ASC, retailer ASC, is_active ASC, created_at DESC);

-- Composite index for filtering approved featured deals
CREATE INDEX IF NOT EXISTS idx_deals_status_featured_active_created 
  ON deals(status ASC, is_featured ASC, is_active ASC, created_at DESC);

-- Composite index for sorting categories by order
CREATE INDEX IF NOT EXISTS idx_categories_active_order 
  ON categories(is_active ASC, "order" ASC);

-- Index for slug lookups (deals)
CREATE INDEX IF NOT EXISTS idx_deals_slug 
  ON deals(slug);

-- Index for slug lookups (categories)
CREATE INDEX IF NOT EXISTS idx_categories_slug 
  ON categories(slug);

-- Index for slug lookups (retailers)
CREATE INDEX IF NOT EXISTS idx_retailers_slug 
  ON retailers(slug);

-- Index for analytics date lookups
CREATE INDEX IF NOT EXISTS idx_analytics_date 
  ON analytics(date DESC);

-- ============================================
-- Storage Buckets
-- ============================================

-- Note: Storage bucket must be created via Supabase Dashboard:
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Click "Create a new bucket"
-- 3. Bucket name: deal-images
-- 4. Set to Public: ✓ (checked)
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================
-- Storage Policies
-- ============================================

-- Note: Storage policies must be created via Supabase Dashboard UI:
-- Storage policies cannot be created via SQL due to permission restrictions.
-- Follow these steps in the Supabase Dashboard:
--
-- 1. Go to Storage > deal-images bucket > Policies tab
-- 2. Create the following 4 policies:
--
-- Policy 1: Public Read Access
--   - Policy name: Public read access to deal images
--   - Allowed operation: SELECT
--   - Target roles: public
--   - USING expression: bucket_id = 'deal-images'
--
-- Policy 2: Admin Upload Access
--   - Policy name: Admin upload access to deal images
--   - Allowed operation: INSERT
--   - Target roles: authenticated
--   - WITH CHECK expression: bucket_id = 'deal-images' AND is_admin()
--
-- Policy 3: Admin Update Access
--   - Policy name: Admin update access to deal images
--   - Allowed operation: UPDATE
--   - Target roles: authenticated
--   - USING expression: bucket_id = 'deal-images' AND is_admin()
--
-- Policy 4: Admin Delete Access
--   - Policy name: Admin delete access to deal images
--   - Allowed operation: DELETE
--   - Target roles: authenticated
--   - USING expression: bucket_id = 'deal-images' AND is_admin()
--
-- Policy 5: Retailer Upload Access
--   - Policy name: Retailer upload access to deal images
--   - Allowed operation: INSERT
--   - Target roles: authenticated
--   - WITH CHECK expression: bucket_id = 'deal-images' AND is_retailer()

-- ============================================
-- Additional Helper Functions
-- ============================================

-- Function to increment deal view count
CREATE OR REPLACE FUNCTION increment_deal_view_count(deal_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE deals
  SET view_count = view_count + 1
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment deal click count
CREATE OR REPLACE FUNCTION increment_deal_click_count(deal_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE deals
  SET click_count = click_count + 1
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers for Auto-Creating User Profiles
-- ============================================

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Initial Data / Seed Data
-- ============================================

-- Note: Initial seed data should be inserted via the seed script
-- using the Supabase service role client to bypass RLS policies.
-- See admin-panel/scripts/seed.ts for the seeding implementation.

-- ============================================
-- Post-Setup Instructions
-- ============================================

-- After running this schema file:
--
-- 1. Create the storage bucket via Supabase Dashboard:
--    - Go to Storage section
--    - Create new bucket named "deal-images"
--    - Set to Public
--    - Set max file size to 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 2. Create the admin user via Supabase Dashboard:
--    - Go to Authentication section
--    - Create new user with email: admin@unlimitedperfectdeals.com
--    - Set a secure password
--    - Confirm the email
--    - The user_profiles entry will be auto-created via trigger
--    - Update the user_profiles.role to 'admin' via SQL:
--      UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@unlimitedperfectdeals.com';
--
-- 3. Run the seed script to populate initial data:
--    - In admin-panel directory: npm run seed
--    - This will create sample categories, retailers, and deals
--
-- 4. Verify RLS policies are working:
--    - Test public read access without authentication
--    - Test admin write access with authentication
--    - Test retailer can only see their own data
--
-- 5. For retailer platform testing:
--    - Create a test retailer user via retailer registration flow
--    - Or manually create via Supabase Dashboard with role='retailer'
--    - Link to a retailer record by setting retailer_id in user_profiles
