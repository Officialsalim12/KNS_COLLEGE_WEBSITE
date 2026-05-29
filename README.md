# KNS College Official Website

Welcome to the official repository for the **KNS College** website. This platform serves as a central hub for all college-related activities, providing information on academic programs, handling admissions, managing student inquiries, and facilitating secure online payments.

## 👨‍💻 Lead Developer
**Abdul Salim Gani** 

## 🌟 Features
- **Dynamic Course Catalog**: Browse detailed pages for Diplomas, Certificates, Corporate Training, and Online Courses.
- **Online Admissions & Enrollment**: Secure forms for student applications and course enrollment (`/api/enrollments`).
- **Scholarship Management**: Detailed scholarship listings and an integrated application pipeline (`/api/scholarships`, `/api/scholarship-applications`).
- **Payment Integration**: Secure tuition and fee payments integration via Monime (`/api/payments`).
- **Interactive AI Chatbot**: Built-in intelligent assistant to help prospective students and visitors navigate the site and find information.
- **Communication & Enquiries**: Contact and inquiry forms connected to a robust backend system with email notifications via SendGrid (`/api/messages`, `/api/contacts`, `/api/enquiries`).
- **Fully Responsive Design**: Optimized for mobile, tablet, and desktop viewing.

## 🛠️ Tech Stack
This project uses a decoupled architecture for maximum flexibility and performance:

### Frontend
- **Languages**: HTML5, Vanilla JavaScript, CSS3
- **Design Philosophy**: Custom semantic layouts, fully responsive without heavy UI frameworks.

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Mail Service**: SendGrid (`@sendgrid/mail`)
- **Other Utilities**: Multer (file uploads), CORS configured for secure API requests.

### Database
- **Provider**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Integration**: `@supabase/supabase-js`

## 🚀 Deployment Overview
The application is split between two hosting environments:

- **Frontend URL (Production)**: [www.kns.edu.sl](https://www.kns.edu.sl) (Hosted on Sector Link)
- **Backend API URL**: `https://kns-college-website.onrender.com` (Hosted on Render, Plan: Free)
- **Database**: Hosted securely on Supabase.

*Note: The frontend config automatically points to the Render backend when deployed.*

## 💻 Getting Started (Local Development)

To run this project locally, follow these steps:

### Prerequisites
- Node.js (v16+ recommended)
- NPM (Node Package Manager)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kns-college-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` or `.env.local` file in the root directory and add the necessary secret keys:
   ```env
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SENDGRID_API_KEY=your_sendgrid_key
   SENDGRID_FROM_EMAIL=your_verified_sender
   SENDGRID_TO_EMAIL=admin_notification_receiver
   ```

4. **Start the development server:**
   ```bash
   # Starts the server using nodemon for hot-reloading
   npm run dev
   ```

5. **Open the frontend:**
   Open `index.html` in your browser (preferably via an extension like Live Server, or simply double-click). The `config.js` script will automatically detect `localhost` and map requests to `http://localhost:3000`.

## 🤝 Contributing (For Junior Developers)

Hello future contributors! If you're picking up where I left off or joining the team, here is how you can contribute:

1. **Understand the Architecture**: Read through `config.js` to understand how the API routing works. The backend logic lives heavily in `server.js` and various handler scripts (like `setup-sender.js` and `contact-form-handler.js`).
2. **Feature Branches**: Always create a new branch for your work (e.g., `feature/add-new-course` or `bugfix/fix-chatbot-ui`).
3. **Commit Standards**: Write descriptive commit messages explaining *what* was changed and *why*.
4. **Environment Variables**: Never commit the `.env` file to version control. If you add a new environment variable requirement, document it in this README.
5. **Testing**: Before pushing, ensure the frontend forms successfully talk to your local backend and update the Supabase instance correctly. Ensure the Render free tier limits (like cold start delays) are considered if adjusting timeout logic.
6. **Code Reviews**: Submit a Pull Request (PR) for any significant changes.

If you ever get stuck, review the Supabase Database dashboard or standard Express.js documentation!

---
*Maintained with ❤️ by Abdul Salim Gani & the KNS Dev Team.*
