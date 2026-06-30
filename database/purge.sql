-- Remove all application data (forms, payments, ratings, scholarships, catalog).
-- Schema and tables are kept. Run: npm run db:purge

TRUNCATE TABLE
    online_course_ratings,
    online_courses,
    online_course_categories,
    scholarship_applications,
    scholarships,
    payments,
    enrollments,
    enquiries,
    contacts,
    messages
RESTART IDENTITY CASCADE;
