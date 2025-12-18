/**
 * Configuration file for API endpoints
 * Update API_BASE_URL to match your server URL
 */

const CONFIG = {
    // API base URL - change this to your server URL
    // For local development: 'http://localhost:3000'
    // For production: 'https://your-domain.com'
    API_BASE_URL: 'http://localhost:3000',
    
    // API endpoints
    ENDPOINTS: {
        MESSAGES: '/api/messages',
        CONTACTS: '/api/contacts',
        ENROLLMENTS: '/api/enrollments',
        PAYMENTS: '/api/payments',
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

