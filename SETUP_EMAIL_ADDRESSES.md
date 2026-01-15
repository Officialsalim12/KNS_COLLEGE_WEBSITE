# Setup Email Addresses in Render

## Step-by-Step Instructions

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in to your account
3. Find and click on your service: **kns-college-backend**

### Step 2: Open Environment Variables
1. In the left sidebar, click **"Environment"**
2. Or go to: **Settings** → **Environment**

### Step 3: Add Environment Variables
Click **"Add Environment Variable"** and add these three variables:

#### Variable 1: Contact Form Emails
- **Key**: `SENDGRID_CONTACT_EMAIL`
- **Value**: `YOUR_EMAIL_HERE@gmail.com`
- Click **Save**

#### Variable 2: Enquiry Form Emails
- **Key**: `SENDGRID_ENQUIRY_EMAIL`
- **Value**: `YOUR_EMAIL_HERE@gmail.com`
- Click **Save**

#### Variable 3: Scholarship Application Emails
- **Key**: `SENDGRID_SCHOLARSHIP_EMAIL`
- **Value**: `YOUR_EMAIL_HERE@gmail.com`
- Click **Save**

### Step 4: Save and Deploy
1. After adding all three variables, Render will automatically detect changes
2. It will show a **"Save Changes"** button - click it
3. Render will automatically redeploy your service (takes 1-2 minutes)

### Step 5: Verify
1. Wait for deployment to complete (check the "Events" tab)
2. Test by submitting a form on your website
3. Check your email inbox for the notification

---

## What Email Address Should You Use?

You can use:
- ✅ Gmail address (e.g., `yourname@gmail.com`)
- ✅ Outlook/Hotmail address (e.g., `yourname@outlook.com`)
- ✅ Yahoo address (e.g., `yourname@yahoo.com`)
- ✅ Any email address that works and you can access

**Important**: Use an email address you can access to receive notifications!

---

## Example Configuration

If your email is `admin@example.com`, you would set:

```
SENDGRID_CONTACT_EMAIL = admin@example.com
SENDGRID_ENQUIRY_EMAIL = admin@example.com
SENDGRID_SCHOLARSHIP_EMAIL = admin@example.com
```

---

## After Setup

Once configured:
- ✅ Contact form submissions → Go to your email
- ✅ Enquiry form submissions → Go to your email
- ✅ Scholarship applications → Go to your email

All emails will be sent from: `scholarships@kns.edu.sl` (verified SendGrid sender)
All emails will be delivered to: Your working email address

---

## Testing

After deployment, test the email endpoint:

```bash
curl -X POST https://kns-college-website.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@gmail.com"}'
```

Or simply submit a test form on your website and check your email!
