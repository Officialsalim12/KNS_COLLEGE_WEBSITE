/**
 * Get API Base URL
 * Automatically detects the correct backend URL:
 * - Localhost: Uses http://localhost:3000 for local development
 * - Production on Render: Uses window.location.origin (when frontend and backend are on same domain)
 * - Production on Sector Link: Uses https://kns-college-website.onrender.com (backend on Render)
 * - Custom: Can be overridden by setting window.RENDER_API_URL or localStorage API_BASE_URL
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
    // Or set it in localStorage: localStorage.setItem('API_BASE_URL', 'https://your-backend.onrender.com')
    if (typeof window !== 'undefined' && window.RENDER_API_URL) {
        console.log('Using window.RENDER_API_URL:', window.RENDER_API_URL);
        return window.RENDER_API_URL;
    }
    
    // Check localStorage for custom API URL (useful for production debugging)
    try {
        const storedApiUrl = localStorage.getItem('API_BASE_URL');
        if (storedApiUrl) {
            console.log('Using localStorage API_BASE_URL:', storedApiUrl);
            return storedApiUrl;
        }
    } catch (e) {
        // localStorage might not be available
    }
    
    // Check if we're on Render (backend domain) - use same origin
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('onrender.com') || currentOrigin.includes('kns-college-website')) {
        console.log('Using window.location.origin as API base URL (on Render):', currentOrigin);
        return currentOrigin;
    }
    
    // Frontend is on Sector Link (or other domain) - use Render backend
    const renderBackendUrl = 'https://kns-college-website.onrender.com';
    console.log('Frontend on different domain, using Render backend:', renderBackendUrl);
    return renderBackendUrl;
}

const CONFIG = {
    /**
     * API Base URL Configuration
     * - Localhost: http://localhost:3000 (for local development)
     * - Production on Render: window.location.origin (when frontend/backend are together)
     * - Production on Sector Link: https://kns-college-website.onrender.com (backend on Render)
     * - Custom: Can override by setting window.RENDER_API_URL before this script loads
     * 
     * Deployment Setup:
     * - Frontend: Hosted on Sector Link
     * - Backend: Hosted on Render (https://kns-college-website.onrender.com)
     * - This config automatically uses the Render backend when frontend is on Sector Link
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

