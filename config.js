function getApiBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    if (isLocalhost) {
        return 'http://localhost:3000';
    } else {
        return window.location.origin;
    }
}

const PRODUCTION_API_URL = 'knscollegewebsite-production.up.railway.app';

const CONFIG = {
    API_BASE_URL: PRODUCTION_API_URL || getApiBaseUrl(),
    
    ENDPOINTS: {
        MESSAGES: '/api/messages',
        CONTACTS: '/api/contacts',
        ENQUIRIES: '/api/enquiries',
        ENROLLMENTS: '/api/enrollments',
        PAYMENTS: '/api/payments',
        STATS: '/api/stats',
        HEALTH: '/api/health'
    },
    
    MONIME_ENDPOINT: 'https://monime.com/payment'
};

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('chatbot_session_id');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
}

