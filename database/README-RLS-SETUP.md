# Row Level Security (RLS) Policy Setup Guide

## Problem
When submitting scholarship applications, you may encounter this error:
```
"new row violates row-level security policy for table \"scholarship_applications\""
```

This happens because Supabase has Row Level Security (RLS) enabled by default, which blocks all operations unless policies are explicitly created.

## Solution

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the RLS Policies
1. Open the file `rls-policies-simple.sql` in this directory
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Policies
After running the SQL, verify the policies were created:
1. In Supabase Dashboard, go to **Authentication** → **Policies**
2. Find the `scholarship_applications` table
3. You should see two policies:
   - "Allow public insert for scholarship applications"
   - "Allow anon select for scholarship applications"

### Step 4: Test the Form
1. Make sure your server is running: `node server.js`
2. Open `scholarship-application.html` in your browser
3. Fill out and submit the form
4. The submission should now succeed!

## Policy Details

### Policy 1: Public INSERT
- **Purpose**: Allows anyone to submit scholarship applications through the public form
- **Who**: Anonymous users (`anon`) and authenticated users (`authenticated`)
- **Operation**: INSERT only

### Policy 2: Public SELECT
- **Purpose**: Allows the backend API to read applications (for admin endpoints)
- **Who**: Anonymous users (`anon`), authenticated users, and service role
- **Operation**: SELECT only

## Security Considerations

### Current Setup (Public Form)
The current policies allow:
- ✅ Anyone to submit applications (required for public form)
- ✅ Backend API to read applications (for admin dashboard)

### For Production (Recommended)
If you want stricter security, consider:

1. **Restrict SELECT to authenticated admins only:**
```sql
-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Allow anon select for scholarship applications" ON scholarship_applications;

-- Create admin-only SELECT policy
CREATE POLICY "Admins can view all applications"
ON scholarship_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      'admin@kns.edu.sl',
      'admissions@kns.edu.sl'
    )
  )
);
```

2. **Add UPDATE policy for status changes:**
```sql
CREATE POLICY "Admins can update application status"
ON scholarship_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      'admin@kns.edu.sl',
      'admissions@kns.edu.sl'
    )
  )
);
```

3. **Disable DELETE (or restrict to admins):**
```sql
-- Option: No DELETE policy (prevents all deletes)
-- Or create admin-only DELETE policy similar to UPDATE
```

## Troubleshooting

### Error: "policy already exists"
If you get this error, drop the existing policy first:
```sql
DROP POLICY IF EXISTS "Allow public insert for scholarship applications" ON scholarship_applications;
DROP POLICY IF EXISTS "Allow anon select for scholarship applications" ON scholarship_applications;
```
Then run the CREATE POLICY commands again.

### Error: "relation does not exist"
Make sure the table name is correct. Check your Supabase table name:
1. Go to **Table Editor** in Supabase Dashboard
2. Verify the table is named `scholarship_applications`
3. If it has a different name, update the SQL accordingly

### Still Getting RLS Errors?
1. Verify RLS is enabled: Check in **Table Editor** → **Settings** → **RLS Enabled**
2. Check policy syntax: Make sure there are no typos in the SQL
3. Check Supabase logs: Go to **Logs** → **Postgres Logs** for detailed error messages

## Files in This Directory

- `rls-policies-simple.sql` - Quick setup (recommended for getting started)
- `rls-policies.sql` - Detailed policies with comments and options
- `README-RLS-SETUP.md` - This file

## Need Help?

If you continue to have issues:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security
2. Review the error message in your server logs
3. Check the Supabase Postgres logs for detailed error information
