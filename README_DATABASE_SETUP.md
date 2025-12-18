# Database Setup Guide for KNS College Website

This guide will help you set up the Supabase database backend to store chatbot messages, contact form submissions, and enrollment form submissions.

## Prerequisites

- Node.js (v14 or higher) installed on your system
- npm (Node Package Manager) - comes with Node.js
- A Supabase account (free tier available at https://supabase.com)

## Installation Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: KNS College (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Wait for the project to be created (takes 1-2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### 3. Set Up Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Supabase and SendGrid credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   PORT=3000
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=notifications@your-domain.com
SENDGRID_TO_EMAIL=admissions@your-domain.com
   ```

   Replace `your-project-id` and `your-anon-key-here` with the values from step 2.

### 4. Install Dependencies

Open a terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install the following packages:
- `express` - Web server framework
- `@supabase/supabase-js` - Supabase JavaScript client
- `cors` - Enable CORS for API requests
- `dotenv` - Load environment variables
- `nodemon` (dev dependency) - Auto-restart server during development

### 5. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `database/schema.sql` into the editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

This will create four tables:
- `messages` - Stores chatbot conversations
- `contacts` - Stores contact form submissions
- `enrollments` - Stores enrollment form submissions
- `payments` - Stores payment/application form submissions

### 6. Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## SendGrid Email Setup (Contact Form)

The contact form on `contact.html` posts to `/api/contacts`. The backend now:

- Saves each submission to the `contacts` table in Supabase.
- Sends an email notification via SendGrid (if configured).

To enable email notifications:

1. Create a SendGrid account and complete any sender identity/domain verification required.
2. In SendGrid, create an **API Key** with “Mail Send” permissions.
3. Copy the API key into your `.env` or `.env.local` file as `SENDGRID_API_KEY`.
4. Set `SENDGRID_FROM_EMAIL` to a verified sender address (e.g. `no-reply@your-domain.com`).
5. Set `SENDGRID_TO_EMAIL` to the address that should receive contact form notifications (e.g. `admissions@kns.edu.sl`).  
   - If `SENDGRID_TO_EMAIL` is not set, the server will fall back to `SENDGRID_FROM_EMAIL`.
6. Restart the Node server so that the new environment variables are picked up.

Behavior notes:

- If SendGrid is not configured (missing API key or emails), contact records are **still saved** to Supabase, but no email is sent (a warning is logged on the server).
- Email send errors are logged on the server but do **not** break the user’s experience; the API still responds with success if the database insert worked.

## Configuration

### Update API URL

Edit `config.js` and update the `API_BASE_URL`:

- **Local development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000', // Change this for production
    // ...
};
```

### Update HTML Files

Make sure all HTML files that use the chatbot or forms include `config.js` before other scripts:

```html
<script src="config.js"></script>
<script src="script.js"></script>
<script src="chatbot.js"></script>
```

**Note**: The main files (index.html, contact.html, about.html, Programmes.html, admissions.html) have already been updated. If you have other HTML files with forms or chatbot, add `config.js` to them as well.

## Database Schema

### Messages Table
Stores chatbot conversation messages:
- `id` - Primary key (BIGSERIAL)
- `session_id` - Unique session identifier (TEXT)
- `sender` - 'user' or 'bot' (TEXT)
- `message` - Message content (TEXT)
- `timestamp` - When the message was sent (TIMESTAMPTZ)
- `ip_address` - Client IP address (TEXT)
- `user_agent` - Browser user agent (TEXT)

### Contacts Table
Stores contact form submissions:
- `id` - Primary key (BIGSERIAL)
- `name` - Full name (TEXT)
- `email` - Email address (TEXT)
- `phone` - Phone number (optional, TEXT)
- `subject` - Subject/category (TEXT)
- `message` - Message content (TEXT)
- `newsletter` - Newsletter subscription (BOOLEAN)
- `timestamp` - Submission timestamp (TIMESTAMPTZ)
- `ip_address` - Client IP address (TEXT)
- `user_agent` - Browser user agent (TEXT)

### Enrollments Table
Stores enrollment form submissions:
- `id` - Primary key (BIGSERIAL)
- `course_name` - Course/programme name (TEXT)
- `first_name` - First name (TEXT)
- `last_name` - Last name (TEXT)
- `email` - Email address (TEXT)
- `phone` - Phone number (optional, TEXT)
- `payment_method` - Payment method selected (TEXT)
- `mobile_number` - Mobile number (optional, TEXT)
- `enrollment_fee` - Enrollment fee amount (TEXT)
- `timestamp` - Submission timestamp (TIMESTAMPTZ)
- `ip_address` - Client IP address (TEXT)
- `user_agent` - Browser user agent (TEXT)

### Payments Table
Stores payment/application form submissions:
- `id` - Primary key (BIGSERIAL)
- `course_name` - Course/programme name (TEXT)
- `full_name` - Full name of applicant (TEXT)
- `email` - Email address (TEXT)
- `phone` - Phone number (TEXT)
- `address` - Street address (TEXT)
- `city` - City (TEXT)
- `country` - Country (TEXT, default: 'Sierra Leone')
- `date_of_birth` - Date of birth (DATE, optional)
- `gender` - Gender (TEXT, optional)
- `emergency_contact` - Emergency contact name (TEXT, optional)
- `emergency_phone` - Emergency contact phone (TEXT, optional)
- `delivery_mode` - Preferred delivery mode (TEXT: 'Online' or 'Hybrid')
- `intake_period` - Preferred intake period (TEXT: 'January', 'May', or 'September')
- `application_fee` - Application fee amount (DECIMAL)
- `payment_status` - Payment status (TEXT: 'pending', 'success', 'failed', 'cancelled')
- `payment_reference` - Payment reference from payment gateway (TEXT, optional)
- `payment_provider` - Payment provider name (TEXT, default: 'monime')
- `timestamp` - Submission timestamp (TIMESTAMPTZ)
- `ip_address` - Client IP address (TEXT)
- `user_agent` - Browser user agent (TEXT)

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Save Chatbot Message
```
POST /api/messages
Body: {
    "sessionId": "session_123",
    "sender": "user" | "bot",
    "message": "Hello"
}
```

### Get Messages by Session
```
GET /api/messages/:sessionId
```

### Save Contact Form
```
POST /api/contacts
Body: {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "admissions",
    "message": "I want to apply",
    "newsletter": true
}
```

### Get All Contacts
```
GET /api/contacts
```

### Save Enrollment Form
```
POST /api/enrollments
Body: {
    "courseName": "Diploma in Cybersecurity",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "paymentMethod": "Bank Transfer",
    "mobileNumber": "+1234567890",
    "enrollmentFee": "Le1,000"
}
```

### Get All Enrollments
```
GET /api/enrollments
```

### Save Payment/Application Form
```
POST /api/payments
Body: {
    "courseName": "Diploma in Cybersecurity",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+232123456789",
    "address": "123 Main Street",
    "city": "Freetown",
    "country": "Sierra Leone",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "emergencyContact": "Jane Doe",
    "emergencyPhone": "+232987654321",
    "deliveryMode": "Online",
    "intakePeriod": "January",
    "applicationFee": 250,
    "paymentReference": "KNS-APP-1234567890-abc123",
    "paymentStatus": "pending"
}
```

### Update Payment Status
```
PATCH /api/payments/:paymentId
Body: {
    "paymentStatus": "success" | "failed" | "cancelled",
    "paymentReference": "KNS-APP-1234567890-abc123"
}
```

### Get All Payments
```
GET /api/payments
Query Parameters:
    - status: Filter by payment status (pending, success, failed, cancelled)
    - course: Filter by course name
    - reference: Filter by payment reference
```

### Get Statistics
```
GET /api/stats
```
Returns counts of messages, contacts, enrollments, payments, and recent activity (last 7 days).

## Testing the Setup

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Test the API** (using curl or Postman):
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Test contact form**:
   - Open `contact.html` in your browser
   - Fill out and submit the form
   - Check the Supabase dashboard or use `GET /api/contacts` to verify

4. **Test chatbot**:
   - Open any page with the chatbot (e.g., `index.html`)
   - Send a message in the chatbot
   - Check the Supabase dashboard or use `GET /api/messages/:sessionId` to verify

5. **Test enrollment form**:
   - Open a page with enrollment form (e.g., `Programmes.html`)
   - Fill out and submit the enrollment form
   - Check the Supabase dashboard or use `GET /api/enrollments` to verify

6. **Test payment/application form**:
   - Open `payment.html` in your browser
   - Fill out and submit the payment form
   - Check the Supabase dashboard or use `GET /api/payments` to verify
   - The payment record will be saved with status 'pending' before redirecting to payment gateway

## Viewing the Database

You can view your data in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** (in the left sidebar)
3. Select the table you want to view (`messages`, `contacts`, `enrollments`, or `payments`)

You can also use the **SQL Editor** to run custom queries:

```sql
-- View all messages
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10;

-- View all contacts
SELECT * FROM contacts ORDER BY timestamp DESC;

-- View all enrollments
SELECT * FROM enrollments ORDER BY timestamp DESC;

-- View all payments
SELECT * FROM payments ORDER BY timestamp DESC;

-- View payments by status
SELECT * FROM payments WHERE payment_status = 'success' ORDER BY timestamp DESC;

-- Count messages by sender
SELECT sender, COUNT(*) as count FROM messages GROUP BY sender;

-- Count payments by status
SELECT payment_status, COUNT(*) as count FROM payments GROUP BY payment_status;
```

## Production Deployment

1. **Update `config.js`** with your production API URL
2. **Set environment variables** on your hosting platform:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `PORT` - Server port (optional, defaults to 3000)
3. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name kns-college-api
   ```
4. **Set up reverse proxy** (nginx/Apache) if needed
5. **Enable HTTPS** for secure API communication
6. **Supabase automatically handles backups** - no manual backup setup needed!

## Troubleshooting

### Environment variables not found
- Make sure you have a `.env` file in the project root
- Verify that `.env` contains `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check that the values are correct (no extra spaces or quotes)

### Database connection error
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active (not paused)
- Ensure the database tables have been created (run the schema.sql in SQL Editor)

### Port already in use
- Change the PORT in `.env` or set environment variable: `PORT=3001 npm start`

### CORS errors
- Make sure `cors` package is installed: `npm install cors`
- Check that the API URL in `config.js` matches your server URL
- Verify Supabase CORS settings in project settings

### API requests failing
- Check browser console for errors
- Verify server is running: `curl http://localhost:3000/api/health`
- Check server logs for error messages
- Verify Supabase tables exist and RLS policies are configured correctly

### Row Level Security (RLS) errors
- The schema includes RLS policies that allow full access
- If you encounter permission errors, check the RLS policies in Supabase dashboard
- Go to **Authentication** → **Policies** to review and adjust policies as needed

## Security Notes

- The current setup uses the Supabase anon key, which is safe for client-side use
- For production, consider:
  - Adding authentication to admin endpoints (`/api/contacts`, `/api/enrollments`)
  - Implementing rate limiting
  - Adding input validation and sanitization
  - Reviewing and tightening RLS policies in Supabase
  - Using environment variables for all sensitive configuration
  - Enabling HTTPS
  - Setting up proper CORS policies

## Supabase Features

With Supabase, you get:
- **Automatic backups** - No manual backup setup needed
- **Real-time subscriptions** - Can be enabled for live updates
- **Built-in authentication** - Ready to use if needed
- **Scalable infrastructure** - Handles growth automatically
- **Web dashboard** - Easy database management
- **Free tier** - Generous free tier for development and small projects

## Support

For issues or questions:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Contact the development team or refer to the project documentation
