-- =====================================================
-- Row Level Security (RLS) Policies for KNS College
-- Supabase Database
-- =====================================================
-- 
-- This file contains RLS policies for the scholarship_applications table
-- Run these SQL commands in your Supabase SQL Editor
--
-- Instructions:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste and run these commands
-- =====================================================

-- Enable Row Level Security on scholarship_applications table
ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Allow public INSERT (for form submissions)
-- =====================================================
-- This policy allows anyone (including anonymous users) to insert
-- new scholarship applications through the public API
CREATE POLICY "Allow public insert for scholarship applications"
ON scholarship_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- =====================================================
-- Policy 2: Allow SELECT for authenticated users (optional)
-- =====================================================
-- This policy allows authenticated users to view applications
-- You may want to restrict this further based on user roles
-- For now, we'll allow authenticated users to read their own applications
-- or all applications if you want admin access
--
-- Option A: Users can only see their own applications (by email)
-- Uncomment this if you want users to see only their own:
/*
CREATE POLICY "Users can view their own applications"
ON scholarship_applications
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = email);
*/

-- Option B: Allow authenticated users to see all applications
-- Uncomment this if you want authenticated users to see all:
/*
CREATE POLICY "Authenticated users can view all applications"
ON scholarship_applications
FOR SELECT
TO authenticated
USING (true);
*/

-- =====================================================
-- Policy 3: Allow SELECT for service role (backend/admin)
-- =====================================================
-- This allows the backend server (using service role key) to read all applications
-- The backend uses the anon key, but you might have admin endpoints using service role
-- Note: Service role bypasses RLS by default, but this is explicit
CREATE POLICY "Service role can view all applications"
ON scholarship_applications
FOR SELECT
TO service_role
USING (true);

-- =====================================================
-- Policy 4: Allow public SELECT for API (if needed)
-- =====================================================
-- If your backend API needs to read applications using the anon key,
-- you can enable this. However, be careful as this exposes all applications publicly.
-- It's better to use authenticated policies or service role for reads.
--
-- For now, we'll comment this out for security:
/*
CREATE POLICY "Allow public select for scholarship applications"
ON scholarship_applications
FOR SELECT
TO anon, authenticated
USING (true);
*/

-- =====================================================
-- Additional Notes:
-- =====================================================
-- 1. The INSERT policy allows anyone to submit applications (needed for public form)
-- 2. SELECT policies are commented out - enable only what you need
-- 3. UPDATE and DELETE policies are not included - add them if needed
-- 4. For production, consider adding:
--    - UPDATE policy for status changes (admin only)
--    - DELETE policy (admin only, or disable entirely)
--    - More restrictive SELECT policies based on user roles
--
-- =====================================================
-- To verify policies are working:
-- =====================================================
-- Run this query in Supabase SQL Editor to check your policies:
-- SELECT * FROM pg_policies WHERE tablename = 'scholarship_applications';
-- =====================================================
