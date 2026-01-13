# Setup Instructions: Create Scholarships Table in Supabase

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com
   - Sign in and select your KNS College project

2. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Run the SQL Script**
   - Open the file: `CREATE-SCHOLARSHIPS-TABLE-AND-DATA.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)

4. **Verify the Setup**
   - Go to **"Table Editor"** in the left sidebar
   - Click on the **"scholarships"** table
   - You should see 2 scholarships:
     - KNS College Full Scholarship 2026
     - KNS College Partial Scholarship 2026 (60% Discount)

5. **Test the API**
   - Visit: `https://kns-college-website.onrender.com/api/scholarships`
   - You should see JSON data with both scholarships

## What This Script Does

✅ Creates the `scholarships` table with all required columns
✅ Sets up indexes for better performance
✅ Enables Row Level Security (RLS)
✅ Creates a public read policy for active scholarships
✅ Inserts 2 scholarship records:
   - Full Scholarship (100% coverage)
   - Partial Scholarship (60% discount)

## Important Notes

- **Deadline**: Set to January 19, 2026 (23:59:59 UTC)
- **Both scholarships are active** (`is_active = true`)
- **RLS Policy**: Allows public read access to active scholarships only
- **PDF Files**: You can add `guide_path` and `form_path` later when PDFs are uploaded to Supabase Storage

## Adding PDF Files Later

After uploading PDFs to Supabase Storage, update the paths:

```sql
UPDATE scholarships 
SET guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Full Scholarship 2026';

UPDATE scholarships 
SET guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-partial-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Partial Scholarship 2026 (60% Discount)';
```

## Troubleshooting

### If you get "relation already exists" error:
- The table already exists. You can either:
  1. Drop it first: `DROP TABLE IF EXISTS scholarships CASCADE;`
  2. Or just run the INSERT statements (skip the CREATE TABLE part)

### If you get permission errors:
- Make sure you're running the script as a database admin
- Check that RLS policies were created correctly

### If scholarships don't show on the website:
1. Check that `is_active = true` for both scholarships
2. Verify RLS policy exists: Go to Authentication → Policies → scholarships
3. Test the API endpoint directly: `/api/scholarships`
4. Check Render logs for any errors

## Verification Checklist

After running the script, verify:

- [ ] Table `scholarships` exists in Table Editor
- [ ] 2 records are visible in the table
- [ ] Both have `is_active = true`
- [ ] RLS is enabled (check in Authentication → Policies)
- [ ] Public read policy exists for active scholarships
- [ ] API endpoint `/api/scholarships` returns data
- [ ] Scholarships page displays the cards

## Need Help?

If you encounter any issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check Render logs for API errors
3. Test the API endpoint directly in browser
4. Verify environment variables in Render (SUPABASE_URL, SUPABASE_ANON_KEY)
