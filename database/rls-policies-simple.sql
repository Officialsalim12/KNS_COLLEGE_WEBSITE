-- =====================================================
-- Quick RLS Policy Setup for Scholarship Applications
-- =====================================================
-- 
-- Copy and paste this into Supabase SQL Editor
-- This enables public form submissions
-- =====================================================

-- Step 1: Enable Row Level Security
ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;

-- Step 2: Allow public INSERT (for form submissions)
-- This is required for the application form to work
CREATE POLICY "Allow public insert for scholarship applications"
ON scholarship_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 3: Allow SELECT for anon role (for backend API to read applications)
-- This allows your backend server to fetch applications using the anon key
CREATE POLICY "Allow anon select for scholarship applications"
ON scholarship_applications
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Done! Your application form should now work.
-- Test by submitting a form at: scholarship-application.html
