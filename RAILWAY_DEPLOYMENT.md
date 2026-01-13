# Railway Deployment Guide

Your project has been prepared for Railway deployment. Follow these steps to complete the deployment:

## ✅ Completed Steps
1. ✅ Railway CLI installed
2. ✅ Railway project initialized: `reliable-energy`
3. ✅ Configuration files created:
   - `railway.json` - Railway deployment configuration
   - `.gitignore` - Excludes sensitive files
   - `server.js` - Updated to serve static files
4. ✅ Code pushed to GitHub

## 📋 Next Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.com/project/2c0f919d-568d-4c76-a7a9-bbd707bf549d
   - Or go to https://railway.com and select your project

2. **Connect GitHub Repository**
   - Click "New" or "Add Service"
   - Select "GitHub Repo"
   - Choose your repository: `Officialsalim12/KNS_COLLEGE_WEBSITE`
   - Select the `main` branch

3. **Configure Environment Variables**
   Railway will automatically detect your Node.js project. You need to add these environment variables in the Railway dashboard:
   
   **Required:**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   
   **Optional (for email functionality):**
   - `SENDGRID_API_KEY` - Your SendGrid API key
   - `SENDGRID_FROM_EMAIL` - Email address to send from
   - `SENDGRID_TO_EMAIL` - Email address to receive notifications
   
   **Optional:**
   - `CORS_ORIGIN` - Set to your domain (e.g., `https://yourdomain.com`) or leave as `*`
   - `PORT` - Railway sets this automatically, but you can override if needed

4. **Deploy**
   - Railway will automatically deploy when you connect the GitHub repo
   - Or click "Deploy" in the dashboard

### Option 2: Deploy via CLI (Manual Steps)

If you prefer using the CLI, run these commands in your terminal:

```bash
# Link to your project (select "reliable-energy" when prompted)
railway link

# Add environment variables (run for each variable)
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_ANON_KEY=your_supabase_key
railway variables set SENDGRID_API_KEY=your_sendgrid_key
railway variables set SENDGRID_FROM_EMAIL=your_email@example.com

# Deploy
railway up
```

## 🔧 Configuration Notes

- **Port**: Railway automatically sets the `PORT` environment variable. Your server.js is configured to use `process.env.PORT || 3000`
- **Static Files**: The server now serves all HTML, CSS, and JS files from the root directory
- **API Endpoints**: All API endpoints are available at `/api/*`
- **Database**: Make sure your Supabase database is set up with the required tables (messages, contacts, enquiries, enrollments, payments, scholarships)

## 🌐 After Deployment

Once deployed, Railway will provide you with a URL like:
- `https://your-project-name.up.railway.app`

Update your `config.js` file with the new Railway URL if needed, or Railway will automatically use the correct domain.

## 📝 Environment Variables Reference

Create these in Railway Dashboard → Your Service → Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `SENDGRID_API_KEY` | No | For email notifications |
| `SENDGRID_FROM_EMAIL` | No | Email to send from |
| `SENDGRID_TO_EMAIL` | No | Email to receive notifications |
| `CORS_ORIGIN` | No | CORS allowed origin (default: `*`) |
| `PORT` | No | Server port (auto-set by Railway) |

## 🐛 Troubleshooting

- **Build fails**: Check that all dependencies in `package.json` are correct
- **Database errors**: Verify Supabase credentials are correct
- **Static files not loading**: Check that `server.js` is serving static files correctly
- **Port errors**: Railway sets PORT automatically, don't hardcode it

## 🔗 Useful Links

- Railway Dashboard: https://railway.com/project/2c0f919d-568d-4c76-a7a9-bbd707bf549d
- Railway Docs: https://docs.railway.app
- Your GitHub Repo: https://github.com/Officialsalim12/KNS_COLLEGE_WEBSITE
