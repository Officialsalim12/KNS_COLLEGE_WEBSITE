-- ============================================
-- CREATE SCHOLARSHIPS TABLE IN SUPABASE
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This will create the table, set up RLS, and insert scholarship data

-- Step 1: Create the scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    award_summary TEXT NOT NULL,
    eligibility_criteria TEXT,
    application_requirements TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    guide_path TEXT,
    form_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scholarships_is_active ON scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_active_deadline ON scholarships(is_active, deadline);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to active scholarships" ON scholarships;
DROP POLICY IF EXISTS "Allow authenticated users to read all scholarships" ON scholarships;
DROP POLICY IF EXISTS "Public can view active scholarships" ON scholarships;

-- Step 5: Create public read policy for active scholarships
CREATE POLICY "Allow public read access to active scholarships"
    ON scholarships
    FOR SELECT
    TO public
    USING (is_active = true);

-- Step 6: Clear any existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM scholarships;

-- Step 7: Insert Full Scholarship Data
INSERT INTO scholarships (
    title,
    description,
    award_summary,
    eligibility_criteria,
    application_requirements,
    deadline,
    is_active
) VALUES (
    'KNS College Full Scholarship 2026',
    'Full tuition scholarship covering 100% of course fees for eligible students pursuing diploma programmes at KNS College. This scholarship includes globally recognised industry-led exam vouchers, Digital Credly Badges, and access to professional networking events.',
    '100% tuition coverage for the entire 2-year programme duration, including globally recognised industry-led exam vouchers and Digital Credly Badges',
    'Must be a Sierra Leonean citizen, demonstrate financial need, maintain minimum academic standards, and submit all required documents including academic certificates, valid ID, passport-size photograph, CV, and recommendation letter (optional but advantageous).',
    'Completed application form, academic certificate(s)/result slip, valid ID (National ID or Passport), passport-size photograph, Curriculum Vitae (CV), recommendation letter (optional but advantageous), and personal statement (not more than 300 words).',
    '2026-01-19 23:59:59+00'::timestamptz,
    true
);

-- Step 8: Insert Partial Scholarship Data (60% Discount)
INSERT INTO scholarships (
    title,
    description,
    award_summary,
    eligibility_criteria,
    application_requirements,
    deadline,
    is_active
) VALUES (
    'KNS College Partial Scholarship 2026 (60% Discount)',
    'Partial scholarship providing 60% discount on tuition fees for eligible students pursuing diploma programmes at KNS College. This scholarship includes globally recognised industry-led exam vouchers, Digital Credly Badges, and access to professional networking events.',
    '60% discount on tuition fees for the entire 2-year programme duration, including globally recognised industry-led exam vouchers and Digital Credly Badges',
    'Must be a Sierra Leonean citizen, demonstrate academic merit, maintain minimum academic standards, and submit all required documents including academic certificates, valid ID, passport-size photograph, CV, and recommendation letter (optional but advantageous).',
    'Completed application form, academic certificate(s)/result slip, valid ID (National ID or Passport), passport-size photograph, Curriculum Vitae (CV), recommendation letter (optional but advantageous), and personal statement (not more than 300 words).',
    '2026-01-19 23:59:59+00'::timestamptz,
    true
);

-- Step 9: Verify the data was inserted
SELECT 
    id,
    title,
    award_summary,
    deadline,
    is_active,
    created_at
FROM scholarships
ORDER BY title;

-- ============================================
-- NOTES
-- ============================================
-- 1. Application Deadline: 19 January 2026 (23:59:59 UTC)
-- 2. Both scholarships are set to is_active = true
-- 3. RLS policy allows public read access to active scholarships
-- 4. You can update guide_path and form_path later when PDFs are uploaded to Supabase Storage
-- 5. To update PDF paths later, run:
--    UPDATE scholarships 
--    SET guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/filename.pdf',
--        form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/filename.pdf'
--    WHERE title = 'KNS College Full Scholarship 2026';

-- ============================================
-- AVAILABLE DIPLOMA PROGRAMMES
-- ============================================
-- The following diploma programmes are available for scholarship applicants:
-- • Cybersecurity
-- • Telecommunications
-- • Project Management
-- • Entrepreneurship & Small Business
-- • Applied Computerized Accounting (QuickBooks)
-- • IT with Business Management
-- • Computing & Networking
-- Programme Duration: 2 Years

-- ============================================
-- CONTACT INFORMATION
-- ============================================
-- Submit completed application to:
-- 📧 admissions@kns.edu.sl
-- 📍 18 Dundas Street, Freetown
-- 🌐 www.kns.edu.sl
-- 📞 +232 79 442 442 | +232 75 442 442
-- 📱 @knscollegesl
