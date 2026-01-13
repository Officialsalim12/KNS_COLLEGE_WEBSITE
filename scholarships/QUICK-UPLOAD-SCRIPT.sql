-- Quick SQL Script to Update Scholarship PDF Paths
-- Replace [YOUR-PROJECT-REF] with your actual Supabase project reference
-- Replace [FILE-NAMES] with your actual uploaded file names

-- ============================================
-- STEP 1: Find Your Project Reference
-- ============================================
-- Go to Supabase Dashboard → Settings → API
-- Copy the project reference from the Project URL
-- Example: If URL is https://abcdefghijklmnop.supabase.co
--          Then project ref is: abcdefghijklmnop

-- ============================================
-- STEP 2: Update Full Scholarship
-- ============================================
UPDATE scholarships
SET 
    guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Full Scholarship 2026';

-- ============================================
-- STEP 3: Update Partial Scholarship
-- ============================================
UPDATE scholarships
SET 
    guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-partial-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Partial Scholarship 2026 (60% Discount)';

-- ============================================
-- STEP 4: Verify Updates
-- ============================================
-- Run this query to see all scholarship paths:
SELECT 
    id,
    title,
    guide_path,
    form_path,
    is_active
FROM scholarships
ORDER BY title;

-- ============================================
-- EXAMPLE WITH ACTUAL VALUES
-- ============================================
-- Replace with your actual project ref and file names:

/*
UPDATE scholarships
SET 
    guide_path = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf',
    form_path = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Full Scholarship 2026';

UPDATE scholarships
SET 
    guide_path = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-guides/kns-partial-scholarship-guide-2026.pdf',
    form_path = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Partial Scholarship 2026 (60% Discount)';
*/
