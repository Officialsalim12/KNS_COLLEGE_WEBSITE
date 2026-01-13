# Step-by-Step Guide: Uploading PDF Files to Supabase for Scholarships

This guide will walk you through uploading PDF files (guides and application forms) to Supabase Storage and linking them to your scholarships table.

## Prerequisites

- Supabase account and project
- Access to your Supabase project dashboard
- PDF files ready to upload (guides and application forms)

---

## Step 1: Access Supabase Storage

1. **Log in to Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in to your account

2. **Select Your Project**
   - Choose your KNS College project from the dashboard

3. **Navigate to Storage**
   - In the left sidebar, click on **"Storage"**
   - This will show you all your storage buckets

---

## Step 2: Create Storage Buckets

You need to create two buckets: one for guides and one for forms.

### Create "scholarships-guides" Bucket

1. Click the **"New bucket"** button (or **"Create bucket"**)
2. Enter bucket name: `scholarships-guides`
3. **Important Settings:**
   - **Public bucket**: ✅ **Enable this** (so files can be accessed via URL)
   - **File size limit**: Set to 10MB or higher (PDFs can be large)
   - **Allowed MIME types**: Leave empty or add `application/pdf`
4. Click **"Create bucket"**

### Create "scholarships-forms" Bucket

1. Click **"New bucket"** again
2. Enter bucket name: `scholarships-forms`
3. **Important Settings:**
   - **Public bucket**: ✅ **Enable this**
   - **File size limit**: Set to 10MB or higher
   - **Allowed MIME types**: Leave empty or add `application/pdf`
4. Click **"Create bucket"**

---

## Step 3: Upload PDF Files

### Upload Scholarship Guides

1. Click on the **"scholarships-guides"** bucket
2. Click the **"Upload file"** button (or drag and drop)
3. Select your PDF guide file (e.g., `kns-full-scholarship-guide-2026.pdf`)
4. Wait for upload to complete
5. **Copy the file path** - it will look like:
   ```
   scholarships-guides/kns-full-scholarship-guide-2026.pdf
   ```

### Upload Application Forms

1. Click on the **"scholarships-forms"** bucket
2. Click the **"Upload file"** button
3. Select your PDF form file (e.g., `kns-college-scholarship-application-form-2026.pdf`)
4. Wait for upload to complete
5. **Copy the file path** - it will look like:
   ```
   scholarships-forms/kns-college-scholarship-application-form-2026.pdf
   ```

---

## Step 4: Get Public URLs

After uploading, you need to get the public URL for each file.

### Method 1: From Storage Dashboard

1. Click on the uploaded file in the bucket
2. You'll see file details
3. **Copy the public URL** - it will look like:
   ```
   https://[your-project-ref].supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf
   ```

### Method 2: Construct the URL Manually

The URL format is:
```
https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/[BUCKET-NAME]/[FILE-NAME]
```

**Example:**
```
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf
```

**To find your project ref:**
- Go to **Settings** → **API** in Supabase
- Look for **"Project URL"** - the ref is the part before `.supabase.co`

---

## Step 5: Update Scholarships Table

Now you need to update your scholarships table with the file paths.

### Option A: Using Supabase SQL Editor

1. Go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Run this SQL (replace with your actual values):

```sql
-- Update a specific scholarship with PDF paths
UPDATE scholarships
SET 
    guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Full Scholarship 2026';
```

**Example with actual values:**
```sql
UPDATE scholarships
SET 
    guide_path = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf',
    form_path = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Full Scholarship 2026';
```

### Option B: Using Supabase Table Editor

1. Go to **Table Editor** in the left sidebar
2. Click on the **"scholarships"** table
3. Find the scholarship you want to update
4. Click on the row to edit
5. In the **"guide_path"** field, paste the full URL
6. In the **"form_path"** field, paste the full URL
7. Click **"Save"** (or press Enter)

### Option C: Update Multiple Scholarships

```sql
-- Update Full Scholarship
UPDATE scholarships
SET 
    guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-full-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Full Scholarship 2026';

-- Update Partial Scholarship
UPDATE scholarships
SET 
    guide_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-guides/kns-partial-scholarship-guide-2026.pdf',
    form_path = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/scholarships-forms/kns-college-scholarship-application-form-2026.pdf'
WHERE title = 'KNS College Partial Scholarship 2026 (60% Discount)';
```

---

## Step 6: Verify the Setup

1. **Check Storage Buckets:**
   - Go to **Storage** → Verify files are uploaded
   - Click on a file → Verify it opens/downloads correctly

2. **Check Database:**
   - Go to **Table Editor** → **scholarships**
   - Verify `guide_path` and `form_path` columns have URLs

3. **Test on Website:**
   - Visit your scholarships page
   - Click "View Details" on a scholarship
   - Click "Download Guide" or "Download Form"
   - Verify the PDF downloads correctly

---

## Step 7: Update Server.js (If Needed)

If you're using local file paths instead of Supabase URLs, you may need to update your server configuration. However, if you're using Supabase Storage URLs directly, no server changes are needed - the files will be served directly from Supabase.

---

## Troubleshooting

### Issue: Files Not Accessible

**Problem:** Getting 404 or access denied errors

**Solutions:**
1. ✅ Make sure buckets are set to **"Public"**
2. ✅ Check the URL is correct (no typos)
3. ✅ Verify file exists in the bucket
4. ✅ Check bucket policies allow public access

### Issue: Wrong URL Format

**Problem:** URLs not working

**Solution:** Use the full Supabase Storage URL format:
```
https://[PROJECT-REF].supabase.co/storage/v1/object/public/[BUCKET]/[FILE]
```

### Issue: File Too Large

**Problem:** Upload fails

**Solution:**
1. Check file size (should be under bucket limit)
2. Increase bucket file size limit in bucket settings
3. Consider compressing the PDF

### Issue: CORS Errors

**Problem:** Files won't load from website

**Solution:**
1. Go to **Storage** → **Policies**
2. Create a policy that allows public read access
3. Or use Supabase Storage API with proper CORS headers

---

## Quick Reference: File Naming Convention

**Recommended naming:**
- Guides: `[scholarship-name]-guide-[year].pdf`
  - Example: `kns-full-scholarship-guide-2026.pdf`
- Forms: `kns-college-scholarship-application-form-[year].pdf`
  - Example: `kns-college-scholarship-application-form-2026.pdf`

---

## Security Best Practices

1. ✅ **Use public buckets** for files that should be downloadable
2. ✅ **Use private buckets** for sensitive documents (requires authentication)
3. ✅ **Set file size limits** to prevent abuse
4. ✅ **Use descriptive file names** for easy management
5. ✅ **Organize files** in separate buckets (guides vs forms)

---

## Alternative: Using Local File Serving

If you prefer to serve files from your own server instead of Supabase Storage:

1. Upload files to your server's `scholarships/guides/` and `scholarships/forms/` directories
2. Use relative paths in the database:
   - `guide_path`: `/scholarships/guides/filename.pdf`
   - `form_path`: `/scholarships/forms/filename.pdf`
3. Make sure your server.js has static file serving configured (already done)

---

## Summary Checklist

- [ ] Created `scholarships-guides` bucket (public)
- [ ] Created `scholarships-forms` bucket (public)
- [ ] Uploaded all guide PDFs to guides bucket
- [ ] Uploaded all form PDFs to forms bucket
- [ ] Copied public URLs for each file
- [ ] Updated scholarships table with `guide_path` URLs
- [ ] Updated scholarships table with `form_path` URLs
- [ ] Tested file downloads on the website
- [ ] Verified files are accessible

---

**Need Help?** Check Supabase documentation: [https://supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage)
