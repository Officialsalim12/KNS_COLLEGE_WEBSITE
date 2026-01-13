/**
 * KNS College Backend Server
 * Handles API requests for messages, contacts, and enrollments
 * Uses Supabase as the database backend
 */

// Load environment variables
// Try .env.local first (for local development), then .env, then use system env vars (for production)
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, '.env.local'))) {
    require('dotenv').config({ path: '.env.local' });
} else if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: '.env' });
} else {
    // In production (Render), environment variables are already set
    // dotenv will use process.env if no file is found
    require('dotenv').config();
}

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Log environment status (without exposing sensitive values)
console.log('Environment check:');
console.log(`  SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}`);
console.log(`  SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '✗ Missing'}`);
console.log(`  PORT: ${PORT}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
    console.error('For production deployment, set these in your hosting platform environment variables');
    console.error('For local development, create a .env.local file with your Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configure SendGrid
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
const sendgridToEmail =
    process.env.SENDGRID_TO_EMAIL || process.env.SENDGRID_FROM_EMAIL;

if (!sendgridApiKey) {
    console.warn(
        'Warning: SENDGRID_API_KEY is not set. Contact form emails will not be sent.'
    );
} else {
    sgMail.setApiKey(sendgridApiKey);
}

// Middleware
// CORS configuration - allows requests from any origin
// For production, you may want to restrict this to specific domains
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*', // Set CORS_ORIGIN env var to restrict origins (e.g., 'https://kns.edu.sl')
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS) from root directory
app.use(express.static(__dirname));

app.use('/scholarships', express.static('scholarships', {
    setHeaders: (res, path) => {
        if (path.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment');
        } else if (path.endsWith('.doc') || path.endsWith('.docx')) {
            res.setHeader('Content-Type', 'application/msword');
            res.setHeader('Content-Disposition', 'attachment');
        }
    }
}));

// Initialize database connection
async function initDatabase() {
    try {
        console.log('Testing Supabase connection...');
        // Test the connection by querying a table
        const { data, error } = await supabase.from('messages').select('id').limit(1);
        
        if (error) {
            // PGRST116 is "relation does not exist" - this is okay, table might not exist yet
            if (error.code === 'PGRST116') {
                console.log('✓ Supabase connection successful (messages table does not exist yet)');
            } else {
                console.error('✗ Supabase connection error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
                throw error;
            }
        } else {
            console.log('✓ Connected to Supabase database successfully');
            console.log(`  Supabase URL: ${supabaseUrl}`);
        }
        return Promise.resolve();
    } catch (err) {
        console.error('✗ Database connection failed:', err.message);
        console.error('Full error:', err);
        return Promise.reject(err);
    }
}

// Helper function to get client IP address
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           'unknown';
}

// Helper function to get user agent
function getUserAgent(req) {
    return req.headers['user-agent'] || 'unknown';
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'KNS College API is running' });
});

// Save chatbot message
app.post('/api/messages', async (req, res) => {
    const { sessionId, sender, message } = req.body;
    
    if (!sessionId || !sender || !message) {
        return res.status(400).json({ 
            error: 'Missing required fields: sessionId, sender, and message are required' 
        });
    }
    
    if (sender !== 'user' && sender !== 'bot') {
        return res.status(400).json({ 
            error: 'Invalid sender. Must be "user" or "bot"' 
        });
    }
    
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    
    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                session_id: sessionId,
                sender: sender,
                message: message,
                ip_address: ipAddress,
                user_agent: userAgent
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ error: 'Failed to save message' });
    }
    
    res.json({ 
        success: true, 
        messageId: data.id,
        message: 'Message saved successfully' 
    });
});

// Get messages by session ID
app.get('/api/messages/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });
    
    if (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    
    res.json({ success: true, messages: data || [] });
});

// Save contact form submission
app.post('/api/contacts', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            error: 'Missing required fields: name, email, subject, and message are required' 
        });
    }
    
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    
    // Insert only fields that exist in the database schema
    const { data, error } = await supabase
        .from('contacts')
        .insert([
            {
                name: name,
                email: email,
                phone: phone || null,
                subject: subject,
                message: message
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving contact:', error);
        return res.status(500).json({ error: 'Failed to save contact submission' });
    }

    // Attempt to send email via SendGrid (non-blocking for client)
    if (!sendgridApiKey || !sendgridFromEmail || !sendgridToEmail) {
        console.warn(
            'Contact saved, but SendGrid is not fully configured. Skipping email send.'
        );
    } else {
        const subjectLine = `New contact form submission: ${subject || 'No subject'}`;

        const textBody = `
New contact form submission from KNS College website

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Subject: ${subject}

Message:
${message}

IP Address: ${ipAddress}
User Agent: ${userAgent}
Submitted At: ${new Date().toISOString()}
`.trim();

        const htmlBody = `
            <h2>New contact form submission from KNS College website</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message
                .split('\n')
                .map((line) => line.trim())
                .join('<br>')}</p>
            <hr>
            <p><strong>IP Address:</strong> ${ipAddress}</p>
            <p><strong>User Agent:</strong> ${userAgent}</p>
            <p><strong>Submitted At:</strong> ${new Date().toISOString()}</p>
        `;

        const msg = {
            to: 'admissions@kns.edu.sl',
            from: sendgridFromEmail,
            subject: subjectLine,
            text: textBody,
            html: htmlBody,
        };

        sgMail
            .send(msg)
            .then(() => {
                console.log('Contact notification email sent via SendGrid');
            })
            .catch((emailError) => {
                console.error('Error sending contact email via SendGrid:', emailError);
            });
    }
    
    res.json({ 
        success: true, 
        contactId: data.id,
        message: 'Contact submission saved successfully' 
    });
});

// Get all contacts (for admin - you may want to add authentication)
app.get('/api/contacts', async (req, res) => {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('timestamp', { ascending: false });
    
    if (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
    
    res.json({ success: true, contacts: data || [] });
});

// Save enquiry form submission
app.post('/api/enquiries', async (req, res) => {
    const { name, email, phone, programme_interest, preferred_intake, message, newsletter } = req.body;
    
    if (!name || !email || !programme_interest) {
        return res.status(400).json({ 
            error: 'Missing required fields: name, email, and programme_interest are required' 
        });
    }
    
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const newsletterValue = newsletter === true || newsletter === 'yes' || newsletter === 1 || newsletter === 'true';
    
    const { data, error } = await supabase
        .from('enquiries')
        .insert([
            {
                name: name,
                email: email,
                phone: phone || null,
                programme_interest: programme_interest,
                preferred_intake: preferred_intake || null,
                message: message || null,
                newsletter: newsletterValue,
                ip_address: ipAddress,
                user_agent: userAgent
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving enquiry:', error);
        return res.status(500).json({ error: 'Failed to save enquiry submission' });
    }

    // Attempt to send email via SendGrid (non-blocking for client)
    if (!sendgridApiKey || !sendgridFromEmail || !sendgridToEmail) {
        console.warn(
            'Enquiry saved, but SendGrid is not fully configured. Skipping email send.'
        );
    } else {
        const subjectLine = `New programme enquiry: ${programme_interest || 'No programme specified'}`;

        const textBody = `
New programme enquiry from KNS College website

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Programme of Interest: ${programme_interest}
Preferred Intake: ${preferred_intake || 'Not specified'}

Message:
${message || 'No additional message provided'}

Newsletter Opt-in: ${newsletterValue ? 'Yes' : 'No'}
IP Address: ${ipAddress}
User Agent: ${userAgent}
Submitted At: ${new Date().toISOString()}
`.trim();

        const htmlBody = `
            <h2>New programme enquiry from KNS College website</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Programme of Interest:</strong> ${programme_interest}</p>
            <p><strong>Preferred Intake:</strong> ${preferred_intake || 'Not specified'}</p>
            <p><strong>Message:</strong><br>${(message || 'No additional message provided')
                .split('\n')
                .map((line) => line.trim())
                .join('<br>')}</p>
            <p><strong>Newsletter Opt-in:</strong> ${newsletterValue ? 'Yes' : 'No'}</p>
            <hr>
            <p><strong>IP Address:</strong> ${ipAddress}</p>
            <p><strong>User Agent:</strong> ${userAgent}</p>
            <p><strong>Submitted At:</strong> ${new Date().toISOString()}</p>
        `;

        const msg = {
            to: 'enquiry@kns.edu.sl',
            from: sendgridFromEmail,
            subject: subjectLine,
            text: textBody,
            html: htmlBody,
        };

        sgMail
            .send(msg)
            .then(() => {
                console.log('Enquiry notification email sent via SendGrid');
            })
            .catch((emailError) => {
                console.error('Error sending enquiry email via SendGrid:', emailError);
            });
    }
    
    res.json({ 
        success: true, 
        enquiryId: data.id,
        message: 'Enquiry submission saved successfully' 
    });
});

// Get all enquiries (for admin - you may want to add authentication)
app.get('/api/enquiries', async (req, res) => {
    const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('timestamp', { ascending: false });
    
    if (error) {
        console.error('Error fetching enquiries:', error);
        return res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
    
    res.json({ success: true, enquiries: data || [] });
});

// Save enrollment form submission
app.post('/api/enrollments', async (req, res) => {
    const { 
        courseName, 
        firstName, 
        lastName, 
        email, 
        phone, 
        paymentMethod, 
        mobileNumber,
        enrollmentFee 
    } = req.body;
    
    if (!courseName || !firstName || !lastName || !email) {
        return res.status(400).json({ 
            error: 'Missing required fields: courseName, firstName, lastName, and email are required' 
        });
    }
    
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    
    const { data, error } = await supabase
        .from('enrollments')
        .insert([
            {
                course_name: courseName,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone || null,
                payment_method: paymentMethod || null,
                mobile_number: mobileNumber || null,
                enrollment_fee: enrollmentFee || 'Le1,000',
                ip_address: ipAddress,
                user_agent: userAgent
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving enrollment:', error);
        return res.status(500).json({ error: 'Failed to save enrollment submission' });
    }
    
    res.json({ 
        success: true, 
        enrollmentId: data.id,
        message: 'Enrollment submission saved successfully' 
    });
});

// Get all enrollments (for admin - you may want to add authentication)
app.get('/api/enrollments', async (req, res) => {
    const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('timestamp', { ascending: false });
    
    if (error) {
        console.error('Error fetching enrollments:', error);
        return res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
    
    res.json({ success: true, enrollments: data || [] });
});

// Save payment/application form submission
app.post('/api/payments', async (req, res) => {
    const { 
        courseName, 
        fullName, 
        email, 
        phone, 
        address, 
        city, 
        country, 
        dateOfBirth, 
        gender, 
        emergencyContact, 
        emergencyPhone, 
        deliveryMode, 
        intakePeriod, 
        applicationFee,
        paymentReference,
        paymentStatus
    } = req.body;
    
    if (!courseName || !fullName || !email || !phone || !address || !city || !deliveryMode || !intakePeriod) {
        return res.status(400).json({ 
            error: 'Missing required fields: courseName, fullName, email, phone, address, city, deliveryMode, and intakePeriod are required' 
        });
    }
    
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    
    const { data, error } = await supabase
        .from('payments')
        .insert([
            {
                course_name: courseName,
                full_name: fullName,
                email: email,
                phone: phone,
                address: address,
                city: city,
                country: country || 'Sierra Leone',
                date_of_birth: dateOfBirth || null,
                gender: gender || null,
                emergency_contact: emergencyContact || null,
                emergency_phone: emergencyPhone || null,
                delivery_mode: deliveryMode,
                intake_period: intakePeriod,
                application_fee: applicationFee || 250,
                payment_status: paymentStatus || 'pending',
                payment_reference: paymentReference || null,
                payment_provider: 'monime',
                ip_address: ipAddress,
                user_agent: userAgent
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving payment:', error);
        return res.status(500).json({ error: 'Failed to save payment submission' });
    }
    
    res.json({ 
        success: true, 
        paymentId: data.id,
        message: 'Payment submission saved successfully' 
    });
});

// Update payment status (for webhook/callback from payment provider)
app.patch('/api/payments/:paymentId', async (req, res) => {
    const { paymentId } = req.params;
    const { paymentStatus, paymentReference } = req.body;
    
    if (!paymentStatus) {
        return res.status(400).json({ 
            error: 'Missing required field: paymentStatus is required' 
        });
    }
    
    const updateData = {
        payment_status: paymentStatus
    };
    
    if (paymentReference) {
        updateData.payment_reference = paymentReference;
    }
    
    const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating payment:', error);
        return res.status(500).json({ error: 'Failed to update payment status' });
    }
    
    if (!data) {
        return res.status(404).json({ error: 'Payment record not found' });
    }
    
    res.json({ 
        success: true, 
        payment: data,
        message: 'Payment status updated successfully' 
    });
});

// Get all payments (for admin - you may want to add authentication)
app.get('/api/payments', async (req, res) => {
    const { status, course, reference } = req.query;
    
    let query = supabase
        .from('payments')
        .select('*');
    
    if (status) {
        query = query.eq('payment_status', status);
    }
    
    if (course) {
        query = query.eq('course_name', course);
    }
    
    if (reference) {
        query = query.eq('payment_reference', reference);
    }
    
    query = query.order('timestamp', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    
    res.json({ success: true, payments: data || [] });
});

app.get('/api/scholarships', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .eq('is_active', true)
            .order('deadline', { ascending: true });
        
        if (error) {
            console.error('Error fetching scholarships:', error);
            return res.status(500).json({ error: 'Failed to fetch scholarships' });
        }
        
        res.json({ success: true, scholarships: data || [] });
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
});

app.get('/api/scholarships/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();
        
        if (error) {
            console.error('Error fetching scholarship:', error);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Scholarship not found' });
            }
            return res.status(500).json({ error: 'Failed to fetch scholarship' });
        }
        
        if (!data) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        
        res.json({ success: true, scholarship: data });
    } catch (error) {
        console.error('Error fetching scholarship:', error);
        res.status(500).json({ error: 'Failed to fetch scholarship' });
    }
});

// Get statistics (for admin dashboard)
app.get('/api/stats', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();
        
        // Get total counts
        const [totalMessagesResult, totalContactsResult, totalEnrollmentsResult, totalPaymentsResult] = await Promise.all([
            supabase.from('messages').select('id', { count: 'exact', head: true }),
            supabase.from('contacts').select('id', { count: 'exact', head: true }),
            supabase.from('enrollments').select('id', { count: 'exact', head: true }),
            supabase.from('payments').select('id', { count: 'exact', head: true })
        ]);
        
        // Get recent counts (last 7 days)
        const [recentMessagesResult, recentContactsResult, recentEnrollmentsResult, recentPaymentsResult] = await Promise.all([
            supabase.from('messages').select('id', { count: 'exact', head: true }).gte('timestamp', sevenDaysAgoISO),
            supabase.from('contacts').select('id', { count: 'exact', head: true }).gte('timestamp', sevenDaysAgoISO),
            supabase.from('enrollments').select('id', { count: 'exact', head: true }).gte('timestamp', sevenDaysAgoISO),
            supabase.from('payments').select('id', { count: 'exact', head: true }).gte('timestamp', sevenDaysAgoISO)
        ]);
        
        const stats = {
            totalMessages: totalMessagesResult.count || 0,
            totalContacts: totalContactsResult.count || 0,
            totalEnrollments: totalEnrollmentsResult.count || 0,
            totalPayments: totalPaymentsResult.count || 0,
            recentMessages: recentMessagesResult.count || 0,
            recentContacts: recentContactsResult.count || 0,
            recentEnrollments: recentEnrollmentsResult.count || 0,
            recentPayments: recentPaymentsResult.count || 0
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Initialize database and start server
let server;

initDatabase()
    .then(() => {
        // Bind to 0.0.0.0 to accept connections from all interfaces (required for containers)
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`KNS College API server running on http://0.0.0.0:${PORT}`);
            console.log(`API endpoints available at http://0.0.0.0:${PORT}/api`);
            console.log(`Using Supabase: ${supabaseUrl}`);
        });
        
        // Keep the process alive
        server.on('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
    
    if (server) {
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

