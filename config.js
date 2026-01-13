/**
 * Get API Base URL
 * Automatically detects the correct backend URL:
 * - Localhost: Uses http://localhost:3000 for local development
 * - Production: Uses window.location.origin (works when frontend and backend are on same domain, e.g., Render)
 * - Custom: Can be overridden by setting RENDER_API_URL environment variable or window.RENDER_API_URL
 */
function getApiBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    // For localhost, use local backend
    if (isLocalhost) {
        return 'http://localhost:3000';
    }
    
    // Check for custom Render backend URL (if frontend is hosted separately)
    // You can set this in your HTML: <script>window.RENDER_API_URL = 'https://your-backend.onrender.com';</script>
    if (typeof window !== 'undefined' && window.RENDER_API_URL) {
        return window.RENDER_API_URL;
    }
    
    // Default: Use same origin (works when Express serves both frontend and backend on Render)
    return window.location.origin;
}

const CONFIG = {
    /**
     * API Base URL Configuration
     * - Localhost: http://localhost:3000 (for local development)
     * - Production: window.location.origin (auto-detected, works on Render when frontend/backend are together)
     * - Custom: Can override by setting window.RENDER_API_URL before this script loads
     * 
     * When deployed on Render:
     * - If frontend HTML is served by Express (same domain): Uses window.location.origin automatically ✅
     * - If frontend is hosted separately: Set window.RENDER_API_URL = 'https://your-backend.onrender.com'
     */
    API_BASE_URL: getApiBaseUrl(),
    
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

