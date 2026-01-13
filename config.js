/**
 * Configuration file for API endpoints
 * Update API_BASE_URL to match your server URL
 */

const CONFIG = {
    // Use production URL only if not on localhost, otherwise use localhost
    API_BASE_URL: (window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname === '') 
                   ? 'http://localhost:3000' 
                   : `https://${PRODUCTION_API_URL}`,
    
    // API endpoints
    ENDPOINTS: {
        MESSAGES: '/api/messages',
        CONTACTS: '/api/contacts',
        ENQUIRIES: '/api/enquiries',
        ENROLLMENTS: '/api/enrollments',
        PAYMENTS: '/api/payments',
        SCHOLARSHIPS: '/api/scholarships',
        STATS: '/api/stats',
        HEALTH: '/api/health'
    },
    
    // Payment gateway endpoint
    // Update this with your actual Monime payment endpoint URL
    MONIME_ENDPOINT: 'https://monime.com/payment' // Replace with actual Monime endpoint
};

// Generate a unique session ID for chatbot conversations
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID from sessionStorage
function getSessionId() {
    let sessionId = sessionStorage.getItem('chatbot_session_id');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
}

