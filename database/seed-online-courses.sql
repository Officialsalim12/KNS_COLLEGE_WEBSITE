-- Online course catalog seed data (12 courses).
-- Idempotent: upserts on category slug and course_key. Run after schema migration.

INSERT INTO online_course_categories (slug, section_title, section_lead, sort_order) VALUES
    ('business', 'Business & management', 'Project management, entrepreneurship, accounting, and business technology.', 10),
    ('ict', 'ICT, software & data', 'Digital literacy, cybersecurity, data, hardware, design, and AI essentials.', 20),
    ('microsoft', 'Microsoft & Azure', 'Microsoft Office Specialist and Azure AI learning paths.', 30)
ON CONFLICT (slug) DO UPDATE SET
    section_title = EXCLUDED.section_title,
    section_lead = EXCLUDED.section_lead,
    sort_order = EXCLUDED.sort_order;

-- Deactivate courses not included in the current catalog.
UPDATE online_courses SET is_active = FALSE
WHERE course_key NOT IN (
    'Project Management',
    'Entrepreneurship & Cybersecurity - ESB Certificate',
    'Accounting & IT Fundamentals',
    'Certificate in Computerized Accounting (QuickBooks)',
    'Digital Literacy',
    'Certificate in Cybersecurity (CC)',
    'Certificate in Data Analysis',
    'CompTIA PC & Hardware program',
    'Graphic Design with AI',
    'AI Essentials',
    'Microsoft Office Specialist (MOS) 2019',
    'Azure AI Courses'
);

INSERT INTO online_courses (
    category_slug, course_key, display_title, enroll_course_name,
    price_label, structured_text, pace_text, amount_sle_minor, sort_order, is_active
) VALUES
    ('business', 'Project Management', 'Project Management', 'Project Management',
        'NLe 1000', 'Structured learning', 'Your pace', 100000, 10, TRUE),
    ('business', 'Entrepreneurship & Cybersecurity - ESB Certificate',
        'Entrepreneurship & Cybersecurity - ESB Certificate',
        'Entrepreneurship & Cybersecurity - ESB Certificate',
        'NLe 1000', 'Modules with case studies', 'Flexible schedule', 100000, 20, TRUE),
    ('business', 'Accounting & IT Fundamentals', 'Accounting & IT Fundamentals', 'Accounting & IT Fundamentals',
        'NLe 1000', 'Structured learning', 'Your pace', 100000, 30, TRUE),
    ('business', 'Certificate in Computerized Accounting (QuickBooks)',
        'Certificate in Computerized Accounting (QuickBooks)',
        'Certificate in Computerized Accounting (QuickBooks)',
        'NLe 1000', 'Hands-on labs', 'Self-paced with tutor support', 100000, 40, TRUE),
    ('ict', 'Digital Literacy', 'Digital Literacy', 'Digital Literacy',
        'NLe 1000', 'Foundation digital skills', 'Self-paced learning', 100000, 10, TRUE),
    ('ict', 'Certificate in Cybersecurity (CC)', 'Certificate in Cybersecurity (CC)',
        'Certificate in Cybersecurity (CC)',
        'NLe 1000', 'Hands-on labs', 'Self-paced with tutor support', 100000, 20, TRUE),
    ('ict', 'Certificate in Data Analysis', 'Certificate in Data Analysis', 'Certificate in Data Analysis',
        'NLe 1000', 'Industry-aligned content', 'Learn at your own pace', 100000, 30, TRUE),
    ('ict', 'CompTIA PC & Hardware program', 'CompTIA PC & Hardware program', 'CompTIA PC & Hardware program',
        'NLe 1000', 'Practical hardware skills', 'Your pace', 100000, 40, TRUE),
    ('ict', 'Graphic Design with AI', 'Graphic Design with AI', 'Graphic Design with AI',
        'NLe 1000', 'Creative project work', 'Flexible schedule', 100000, 50, TRUE),
    ('ict', 'AI Essentials', 'AI Essentials', 'AI Essentials',
        'NLe 1000', 'Microsoft Learn pathways', 'Exam-ready in weeks', 100000, 60, TRUE),
    ('microsoft', 'Microsoft Office Specialist (MOS) 2019',
        'Microsoft Office Specialist (MOS) 2019',
        'Microsoft Office Specialist (MOS) 2019',
        'NLe 1000', 'Skills-based assessments', 'Includes exam voucher', 100000, 10, TRUE),
    ('microsoft', 'Azure AI Courses', 'Azure AI Courses', 'Azure AI Courses',
        'NLe 1000', 'Microsoft Learn pathways', 'Exam-ready in weeks', 100000, 20, TRUE)
ON CONFLICT (course_key) DO UPDATE SET
    category_slug = EXCLUDED.category_slug,
    display_title = EXCLUDED.display_title,
    enroll_course_name = EXCLUDED.enroll_course_name,
    price_label = EXCLUDED.price_label,
    structured_text = EXCLUDED.structured_text,
    pace_text = EXCLUDED.pace_text,
    amount_sle_minor = EXCLUDED.amount_sle_minor,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
