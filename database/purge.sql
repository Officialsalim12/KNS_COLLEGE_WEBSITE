-- Application data purge.
-- Truncates form submissions, payments, ratings, scholarships, and course catalog tables.
-- Schema and table structures are preserved.

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
