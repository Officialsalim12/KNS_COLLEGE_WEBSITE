-- Run in Supabase: Dashboard → SQL → New query.
-- Drives the Online Courses page (titles, fees, meta lines). Edit rows in Table Editor.
-- enroll_course_name must stay aligned with online_course_ratings.course_key for stars to match.

CREATE TABLE IF NOT EXISTS public.online_course_categories (
    slug TEXT PRIMARY KEY,
    section_title TEXT NOT NULL,
    section_lead TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.online_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_slug TEXT NOT NULL REFERENCES public.online_course_categories (slug) ON UPDATE CASCADE ON DELETE RESTRICT,
    course_key TEXT NOT NULL UNIQUE,
    display_title TEXT NOT NULL,
    enroll_course_name TEXT NOT NULL,
    price_label TEXT NOT NULL DEFAULT 'NLe 1000',
    structured_text TEXT NOT NULL DEFAULT 'Structured learning',
    pace_text TEXT NOT NULL DEFAULT 'Your pace',
    amount_sle_minor INTEGER NOT NULL DEFAULT 100000,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing projects: add Monime line-item amount (SLE minor units, e.g. 100000 = NLe 1000.00).
ALTER TABLE public.online_courses ADD COLUMN IF NOT EXISTS amount_sle_minor INTEGER NOT NULL DEFAULT 100000;

CREATE INDEX IF NOT EXISTS idx_online_courses_category_sort
    ON public.online_courses (category_slug, sort_order);

CREATE INDEX IF NOT EXISTS idx_online_courses_active
    ON public.online_courses (is_active) WHERE is_active = TRUE;

COMMENT ON TABLE public.online_course_categories IS 'Section headings on the online courses page.';
COMMENT ON TABLE public.online_courses IS 'Catalog cards; enroll_course_name is used for checkout and rating aggregation.';
COMMENT ON COLUMN public.online_courses.amount_sle_minor IS 'Monime charge in SLE minor units (100 = SLE 1.00). Drives checkout session amount when course matches.';

ALTER TABLE public.online_course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "online_course_categories_select_anon" ON public.online_course_categories;
CREATE POLICY "online_course_categories_select_anon"
    ON public.online_course_categories FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "online_courses_select_anon" ON public.online_courses;
CREATE POLICY "online_courses_select_anon"
    ON public.online_courses FOR SELECT
    TO anon
    USING (true);

-- Optional: staff edit data in Table Editor (service role / dashboard bypasses RLS).
-- Re-running this file upserts rows by slug / course_key (safe to refresh defaults).

-- =============================================================================
-- SEED DATA — starter catalog (edit anytime in Supabase)
-- =============================================================================
-- online_course_categories: section headings above each group of cards.
-- online_courses:
--   course_key          stable id; keep in sync with filters + ratings if you change it
--   display_title       short title on the card
--   enroll_course_name  full name sent to checkout + online_course_ratings.course_key
--   price_label         shown on card and in checkout URL (e.g. NLe 1000)
--   structured_text     first meta line (was “Structured learning” on the old site)
--   pace_text           second meta line (was “Your pace” on the old site)
--   amount_sle_minor    Monime charge: SLE minor units (100000 = NLe 1000.00); must match price_label where possible
-- =============================================================================

INSERT INTO public.online_course_categories (slug, section_title, section_lead, sort_order) VALUES
    ('business', 'Business & management', 'Leadership, finance, marketing, and organisational technology.', 10),
    ('ict', 'ICT, software & data', 'Computing, networks, web development, analytics, and AI skills.', 20),
    ('microsoft', 'Microsoft certifications', 'Microsoft 365, Azure fundamentals, Power Platform, and security fundamentals.', 30),
    ('cisco', 'Cisco networking & support', 'Cisco Certified Support Technician (CCST) pathways.', 40),
    ('autodesk', 'Autodesk design', 'Professional CAD and BIM software credentials.', 50)
ON CONFLICT (slug) DO UPDATE SET
    section_title = EXCLUDED.section_title,
    section_lead = EXCLUDED.section_lead,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.online_courses (
    category_slug, course_key, display_title, enroll_course_name, price_label, structured_text, pace_text, amount_sle_minor, sort_order, is_active
) VALUES
    (
        'business',
        'Project Management',
        'Project Management',
        'Project Management',
        'NLe 1000',
        'Structured learning',
        'Your pace',
        100000,
        10,
        TRUE
    ),
    (
        'business',
        'Enterprise and Small Business',
        'Enterprise and Small Business',
        'Enterprise and Small Business',
        'NLe 1000',
        'Modules with case studies',
        'Flexible schedule',
        100000,
        20,
        TRUE
    ),
    (
        'ict',
        'Cybersecurity',
        'Cybersecurity',
        'Cybersecurity',
        'NLe 1000',
        'Hands-on labs',
        'Self-paced with tutor support',
        100000,
        10,
        TRUE
    ),
    (
        'ict',
        'Telecommunications',
        'Telecommunications',
        'Telecommunications',
        'NLe 1000',
        'Industry-aligned content',
        'Learn at your own pace',
        100000,
        20,
        TRUE
    ),
    (
        'microsoft',
        'Microsoft Office Specialist (with Exam Voucher)',
        'Microsoft Office Specialist',
        'Microsoft Office Specialist (with Exam Voucher)',
        'NLe 1000',
        'Skills-based assessments',
        'Includes exam voucher',
        100000,
        10,
        TRUE
    ),
    (
        'microsoft',
        'Microsoft Certified: AI-900 Azure AI Fundamentals',
        'Microsoft AI-900 Azure AI Fundamentals',
        'Microsoft Certified: AI-900 Azure AI Fundamentals',
        'NLe 1000',
        'Microsoft Learn pathways',
        'Exam-ready in weeks',
        100000,
        20,
        TRUE
    ),
    (
        'cisco',
        'Cisco Certified Support Technician (IT Support)',
        'Cisco CCST - IT Support',
        'Cisco Certified Support Technician (IT Support)',
        'NLe 1000',
        'Official Cisco-aligned topics',
        'Practice at home',
        100000,
        10,
        TRUE
    ),
    (
        'cisco',
        'Cisco Certified Support Technician (Cybersecurity)',
        'Cisco CCST - Cybersecurity',
        'Cisco Certified Support Technician (Cybersecurity)',
        'NLe 1000',
        'Security-first curriculum',
        'Study on your schedule',
        100000,
        20,
        TRUE
    ),
    (
        'autodesk',
        'AutoDesk Certified User - Revit Architecture',
        'AutoDesk Revit Architecture',
        'AutoDesk Certified User - Revit Architecture',
        'NLe 1000',
        'Project-based BIM tasks',
        'Your pace',
        100000,
        10,
        TRUE
    ),
    (
        'autodesk',
        'AutoDesk Certified User - AutoCAD',
        'AutoDesk AutoCAD',
        'AutoDesk Certified User - AutoCAD',
        'NLe 1000',
        'Drafting and documentation focus',
        'Flexible study blocks',
        100000,
        20,
        TRUE
    )
ON CONFLICT (course_key) DO UPDATE SET
    category_slug = EXCLUDED.category_slug,
    display_title = EXCLUDED.display_title,
    enroll_course_name = EXCLUDED.enroll_course_name,
    price_label = EXCLUDED.price_label,
    structured_text = EXCLUDED.structured_text,
    pace_text = EXCLUDED.pace_text,
    amount_sle_minor = EXCLUDED.amount_sle_minor,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
