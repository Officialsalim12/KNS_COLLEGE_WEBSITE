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
// CORS configuration - allows requests from Sector Link frontend and other origins
// Frontend is hosted on www.kns.edu.sl, backend is on Render
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) {
            console.log('CORS: Allowing request with no origin');
            return callback(null, true);
        }
        
        // Explicitly allow www.kns.edu.sl and kns.edu.sl
        const allowedDomains = [
            'https://www.kns.edu.sl',
            'https://kns.edu.sl',
            'http://www.kns.edu.sl',
            'http://kns.edu.sl'
        ];
        
        if (allowedDomains.includes(origin) || origin.includes('kns.edu.sl')) {
            console.log(`CORS: Allowing request from KNS domain: ${origin}`);
            return callback(null, true);
        }
        
        // Get allowed origins from environment variable or use default
        const allowedOrigins = process.env.CORS_ORIGIN 
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ['*']; // Default: allow all origins
        
        // If '*' is in allowed origins, allow all
        if (allowedOrigins.includes('*')) {
            console.log(`CORS: Allowing request from origin (wildcard): ${origin}`);
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            console.log(`CORS: Allowing request from origin (in list): ${origin}`);
            callback(null, true);
        } else {
            console.log(`CORS: Allowing request from origin (fallback): ${origin}`);
            callback(null, true); // Still allow, but log for debugging
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Add CORS headers manually as fallback (for maximum compatibility)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Explicitly allow www.kns.edu.sl and kns.edu.sl
    const allowedOrigins = [
        'https://www.kns.edu.sl',
        'https://kns.edu.sl',
        'http://www.kns.edu.sl',
        'http://kns.edu.sl'
    ];
    
    // If origin matches allowed domains, use it; otherwise use origin or wildcard
    if (origin && (allowedOrigins.includes(origin) || origin.includes('kns.edu.sl'))) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`[CORS Header] Set Access-Control-Allow-Origin to: ${origin}`);
    } else if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    if (req.method === 'OPTIONS') {
        console.log(`[CORS] Handling OPTIONS preflight request from origin: ${origin || 'none'}`);
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        console.log(`  Origin: ${req.headers.origin || 'none'}`);
        console.log(`  Referer: ${req.headers.referer || 'none'}`);
    }
    next();
});

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

// Test endpoint for debugging API connectivity
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API test endpoint is working',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'none',
        referer: req.headers.referer || 'none',
        host: req.headers.host || 'none',
        supabase_configured: !!(supabaseUrl && supabaseAnonKey)
    });
});

// Enhanced scholarships test endpoint with detailed diagnostics
app.get('/api/scholarships/diagnostics', async (req, res) => {
    try {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            supabase_configured: !!(supabaseUrl && supabaseAnonKey),
            supabase_url_set: !!supabaseUrl,
            supabase_key_set: !!supabaseAnonKey,
            tests: {}
        };
        
        // Test 1: Basic connection test
        try {
            const { data: testData, error: testError, count } = await supabase
                .from('scholarships')
                .select('*', { count: 'exact' })
                .limit(1);
            
            diagnostics.tests.table_access = {
                success: !testError,
                error: testError ? {
                    code: testError.code,
                    message: testError.message,
                    details: testError.details,
                    hint: testError.hint
                } : null,
                record_count: count || 0,
                sample_record: testData && testData.length > 0 ? testData[0] : null
            };
        } catch (err) {
            diagnostics.tests.table_access = {
                success: false,
                error: { message: err.message }
            };
        }
        
        // Test 2: Check active scholarships
        try {
            const { data: activeData, error: activeError } = await supabase
                .from('scholarships')
                .select('id, title, is_active, deadline')
                .eq('is_active', true)
                .limit(10);
            
            diagnostics.tests.active_scholarships = {
                success: !activeError,
                error: activeError ? {
                    code: activeError.code,
                    message: activeError.message
                } : null,
                count: activeData ? activeData.length : 0,
                records: activeData || []
            };
        } catch (err) {
            diagnostics.tests.active_scholarships = {
                success: false,
                error: { message: err.message }
            };
        }
        
        // Test 3: Check all scholarships (regardless of is_active)
        try {
            const { data: allData, error: allError } = await supabase
                .from('scholarships')
                .select('id, title, is_active')
                .limit(10);
            
            diagnostics.tests.all_scholarships = {
                success: !allError,
                error: allError ? {
                    code: allError.code,
                    message: allError.message
                } : null,
                count: allData ? allData.length : 0,
                records: allData || []
            };
        } catch (err) {
            diagnostics.tests.all_scholarships = {
                success: false,
                error: { message: err.message }
            };
        }
        
        res.json({ success: true, diagnostics });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
});

// Test scholarships endpoint (for debugging)
app.get('/api/scholarships/test', async (req, res) => {
    try {
        console.log('Testing scholarships connection...');
        
        // Test 1: Check if we can query the table at all
        const { data: testData, error: testError, count } = await supabase
            .from('scholarships')
            .select('*', { count: 'exact' })
            .limit(1);
        
        const result = {
            timestamp: new Date().toISOString(),
            supabase_connected: !testError,
            table_exists: !testError || (testError && testError.code !== 'PGRST116' && testError.code !== '42P01'),
            total_records: count || 0,
            test_query_error: testError ? {
                code: testError.code,
                message: testError.message,
                details: testError.details,
                hint: testError.hint
            } : null,
            sample_record: testData && testData.length > 0 ? testData[0] : null
        };
        
        // Test 2: Check active scholarships
        const { data: activeData, error: activeError } = await supabase
            .from('scholarships')
            .select('id, title, is_active')
            .eq('is_active', true)
            .limit(5);
        
        result.active_scholarships_count = activeData ? activeData.length : 0;
        result.active_scholarships = activeData || [];
        result.active_query_error = activeError ? {
            code: activeError.code,
            message: activeError.message
        } : null;
        
        res.json({ success: true, test: result });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
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
                message: message,
                ip_address: ipAddress,
                user_agent: userAgent
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving contact:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        return res.status(500).json({ 
            error: 'Failed to save contact submission',
            details: error.message || 'Unknown database error',
            code: error.code
        });
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
        console.log('=== Scholarships API Request ===');
        console.log(`[${new Date().toISOString()}] GET /api/scholarships`);
        console.log(`  Origin: ${req.headers.origin || 'none'}`);
        console.log(`  Referer: ${req.headers.referer || 'none'}`);
        console.log('Fetching scholarships from Supabase...');
        
        // Try to fetch active scholarships first
        let query = supabase
            .from('scholarships')
            .select('*')
            .eq('is_active', true)
            .order('deadline', { ascending: true });
        
        const { data, error } = await query;
        
        console.log('Supabase query completed');
        console.log(`  Data: ${data ? data.length : 0} records`);
        console.log(`  Error: ${error ? 'Yes' : 'No'}`);
        
        if (error) {
            console.error('Error fetching scholarships:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            
            // Handle specific error cases
            if (error.code === 'PGRST116') {
                // Table doesn't exist
                console.error('Scholarships table does not exist in Supabase');
                return res.status(500).json({ 
                    error: 'Scholarships table not found',
                    details: 'The scholarships table does not exist in the database. Please create it in Supabase.'
                });
            }
            
            if (error.code === '42P01') {
                // Relation does not exist (PostgreSQL error)
                console.error('Scholarships table does not exist');
                return res.status(500).json({ 
                    error: 'Scholarships table not found',
                    details: 'The scholarships table does not exist in the database.'
                });
            }
            
            // Check for RLS/permission errors
            if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
                console.error('Row Level Security (RLS) is blocking access');
                return res.status(500).json({ 
                    error: 'Permission denied',
                    details: 'Row Level Security (RLS) policies are blocking access to scholarships. Please create a public SELECT policy in Supabase.'
                });
            }
            
            return res.status(500).json({ 
                error: 'Failed to fetch scholarships',
                details: error.message || 'Unknown database error',
                code: error.code
            });
        }
        
        // If no active scholarships found, try to get all scholarships to debug
        if (!data || data.length === 0) {
            console.log('No active scholarships found. Checking all scholarships...');
            const { data: allData, error: allError } = await supabase
                .from('scholarships')
                .select('id, title, is_active')
                .limit(5);
            
            if (!allError && allData && allData.length > 0) {
                console.log('Found scholarships in database:', allData);
                console.log('Note: No scholarships have is_active = true. Returning empty array.');
                console.log('TIP: Set is_active = true for scholarships you want to display.');
            } else if (allError) {
                console.error('Error checking all scholarships:', allError);
            } else {
                console.log('No scholarships found in database at all.');
                console.log('TIP: Add scholarships to the Supabase scholarships table.');
            }
        }
        
        console.log(`Successfully fetched ${data ? data.length : 0} active scholarships`);
        console.log('=== End Scholarships API Request ===\n');
        
        // Return response with helpful message if no scholarships
        if (!data || data.length === 0) {
            return res.json({ 
                success: true, 
                scholarships: [],
                message: 'No active scholarships found. Check Supabase to ensure scholarships exist and have is_active = true.'
            });
        }
        
        res.json({ success: true, scholarships: data || [] });
    } catch (error) {
        console.error('Unexpected error fetching scholarships:', error);
        console.error('Error stack:', error.stack);
        console.error('=== End Scholarships API Request (ERROR) ===\n');
        res.status(500).json({ 
            error: 'Failed to fetch scholarships',
            details: error.message || 'Unexpected server error'
        });
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

// Download scholarship files endpoint
app.get('/api/scholarships/:id/download/:type', async (req, res) => {
    const { id, type } = req.params;
    
    // Validate type
    if (type !== 'guide' && type !== 'form') {
        return res.status(400).json({ error: 'Invalid download type. Use "guide" or "form".' });
    }
    
    try {
        console.log(`[Download Request] Scholarship ID: ${id}, Type: ${type}`);
        
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();
        
        if (error) {
            console.error(`[Download Error] Database error:`, error);
            return res.status(404).json({ error: 'Scholarship not found', details: error.message });
        }
        
        if (!data) {
            console.error(`[Download Error] Scholarship not found: ${id}`);
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        
        const filePath = type === 'guide' ? data.guide_path : data.form_path;
        
        console.log(`[Download] File path from database: ${filePath}`);
        
        if (!filePath || filePath === '#' || filePath.trim() === '') {
            console.error(`[Download Error] No file path for ${type}`);
            return res.status(404).json({ 
                error: `${type === 'guide' ? 'Guide' : 'Form'} file not available for this scholarship.`,
                message: 'The file path is not set in the database.'
            });
        }
        
        const trimmedPath = filePath.trim();
        
        // If it's a full URL, proxy the file or redirect
        if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
            console.log(`[Download] External URL detected: ${trimmedPath}`);
            
            // For external URLs, we can either redirect or proxy
            // Redirect is simpler but may have CORS issues
            // Let's proxy it to avoid CORS issues
            try {
                const https = require('https');
                const http = require('http');
                const url = require('url');
                
                const fileUrl = new URL(trimmedPath);
                const protocol = fileUrl.protocol === 'https:' ? https : http;
                
                protocol.get(trimmedPath, (fileResponse) => {
                    if (fileResponse.statusCode !== 200) {
                        console.error(`[Download Error] Failed to fetch external file: ${fileResponse.statusCode}`);
                        return res.status(fileResponse.statusCode).json({ 
                            error: 'Failed to fetch file from external source',
                            statusCode: fileResponse.statusCode
                        });
                    }
                    
                    // Determine content type from response or file extension
                    const contentType = fileResponse.headers['content-type'] || 
                                      (trimmedPath.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
                    
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Disposition', `attachment; filename="${trimmedPath.split('/').pop()}"`);
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    
                    fileResponse.pipe(res);
                }).on('error', (err) => {
                    console.error(`[Download Error] Error fetching external file:`, err);
                    res.status(500).json({ error: 'Failed to fetch file from external source', details: err.message });
                });
            } catch (proxyError) {
                console.error(`[Download Error] Proxy error:`, proxyError);
                // Fallback to redirect
                return res.redirect(trimmedPath);
            }
            return; // Don't continue to file serving
        }
        
        // Otherwise, try to serve from the scholarships directory
        const path = require('path');
        const fs = require('fs');
        
        // Clean the path
        let cleanPath = trimmedPath.replace(/^\/+/, '').replace(/^scholarships\//, '');
        const fullPath = path.join(__dirname, 'scholarships', cleanPath);
        
        console.log(`[Download] Attempting to serve file from: ${fullPath}`);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.error(`[Download Error] File not found: ${fullPath}`);
            console.error(`[Download Error] Current directory: ${__dirname}`);
            console.error(`[Download Error] Scholarships directory exists: ${fs.existsSync(path.join(__dirname, 'scholarships'))}`);
            
            return res.status(404).json({ 
                error: 'File not found',
                path: fullPath,
                message: 'The requested file does not exist on the server.',
                suggestion: 'Please ensure the file exists in the scholarships directory or update the file path in the database.'
            });
        }
        
        // Determine content type
        const ext = path.extname(fullPath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.pdf') {
            contentType = 'application/pdf';
        } else if (ext === '.doc') {
            contentType = 'application/msword';
        } else if (ext === '.docx') {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        
        // Set headers and send file
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        console.log(`[Download] Sending file: ${fullPath}`);
        res.sendFile(fullPath, (err) => {
            if (err) {
                console.error(`[Download Error] Error sending file:`, err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to send file', details: err.message });
                }
            } else {
                console.log(`[Download] File sent successfully: ${fullPath}`);
            }
        });
        
    } catch (error) {
        console.error('[Download Error] Unexpected error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to serve file', details: error.message });
        }
    }
});

// Test endpoint to check file availability
app.get('/api/scholarships/:id/files/check', async (req, res) => {
    const { id } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();
        
        if (error || !data) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        
        const path = require('path');
        const fs = require('fs');
        
        const results = {
            scholarship_id: id,
            scholarship_title: data.title,
            guide_path: data.guide_path,
            form_path: data.form_path,
            guide_exists: false,
            form_exists: false,
            guide_full_path: null,
            form_full_path: null,
            scholarships_dir_exists: fs.existsSync(path.join(__dirname, 'scholarships'))
        };
        
        // Check guide file
        if (data.guide_path && data.guide_path.trim() && !data.guide_path.startsWith('http')) {
            const cleanPath = data.guide_path.replace(/^\/+/, '').replace(/^scholarships\//, '');
            const fullPath = path.join(__dirname, 'scholarships', cleanPath);
            results.guide_full_path = fullPath;
            results.guide_exists = fs.existsSync(fullPath);
        } else if (data.guide_path && (data.guide_path.startsWith('http://') || data.guide_path.startsWith('https://'))) {
            results.guide_exists = 'external_url';
        }
        
        // Check form file
        if (data.form_path && data.form_path.trim() && !data.form_path.startsWith('http')) {
            const cleanPath = data.form_path.replace(/^\/+/, '').replace(/^scholarships\//, '');
            const fullPath = path.join(__dirname, 'scholarships', cleanPath);
            results.form_full_path = fullPath;
            results.form_exists = fs.existsSync(fullPath);
        } else if (data.form_path && (data.form_path.startsWith('http://') || data.form_path.startsWith('https://'))) {
            results.form_exists = 'external_url';
        }
        
        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Error checking files:', error);
        res.status(500).json({ error: 'Failed to check files', details: error.message });
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

// Debug middleware to log ALL API requests (before static files)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        console.log(`  Origin: ${req.headers.origin || 'none'}`);
        console.log(`  Referer: ${req.headers.referer || 'none'}`);
        console.log(`  User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'none'}...`);
    }
    next();
});

// Catch-all handler for unmatched API routes (for debugging)
app.use('/api/*', (req, res) => {
    console.error(`[${new Date().toISOString()}] UNMATCHED API ROUTE: ${req.method} ${req.path}`);
    console.error(`  Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.error(`  Origin: ${req.headers.origin || 'none'}`);
    res.status(404).json({ 
        error: 'API route not found',
        path: req.path,
        method: req.method,
        availableRoutes: [
            'GET /api/health',
            'GET /api/test',
            'GET /api/scholarships',
            'GET /api/scholarships/:id',
            'GET /api/scholarships/:id/download/:type',
            'GET /api/scholarships/test',
            'GET /api/scholarships/diagnostics',
            'POST /api/messages',
            'GET /api/messages/:sessionId',
            'POST /api/contacts',
            'GET /api/contacts',
            'POST /api/enquiries',
            'GET /api/enquiries',
            'POST /api/enrollments',
            'GET /api/enrollments',
            'POST /api/payments',
            'PATCH /api/payments/:paymentId',
            'GET /api/payments',
            'GET /api/stats'
        ]
    });
});

// Serve static files (HTML, CSS, JS) from root directory
// IMPORTANT: This must come AFTER all API routes to prevent conflicts
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

// Initialize database and start server
let server;

initDatabase()
    .then(() => {
        // Log registered API routes for debugging
        console.log('\n=== Registered API Routes ===');
        const routes = [];
        app._router.stack.forEach((middleware) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
                routes.push(`${methods} ${middleware.route.path}`);
            } else if (middleware.name === 'router') {
                // Handle router middleware (like express.Router())
                if (middleware.regexp) {
                    routes.push(`ROUTER ${middleware.regexp}`);
                }
            }
        });
        routes.forEach(route => console.log(`  ${route}`));
        
        // Specifically check for scholarships route
        const hasScholarshipsRoute = routes.some(r => r.includes('/api/scholarships'));
        console.log(`\nScholarships route registered: ${hasScholarshipsRoute ? 'YES ✓' : 'NO ✗'}`);
        console.log('=============================\n');
        
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

