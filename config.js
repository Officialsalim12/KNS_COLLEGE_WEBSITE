/**
 * Get API Base URL
 * Automatically detects the correct backend URL:
 * - Localhost: Uses http://localhost:3000 for local development
 * - Production on Render: Uses window.location.origin (when frontend and backend are on same domain)
 * - Production on Sector Link: Uses https://kns-college-website.onrender.com (backend on Render)
 * - Custom: Can be overridden by setting window.RENDER_API_URL or localStorage API_BASE_URL
 */
/**
 * Normalize API URL to ensure it has a protocol
 * @param {string} url - The URL to normalize
 * @returns {string} - URL with protocol (https:// or http://)
 */
function normalizeApiUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    
    // Remove whitespace
    url = url.trim();
    
    // If URL already has protocol, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // If URL doesn't have protocol, add https://
    // Remove leading slashes if present
    url = url.replace(/^\/+/, '');
    return 'https://' + url;
}

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
        const normalized = normalizeApiUrl(window.RENDER_API_URL);
        console.log('Using window.RENDER_API_URL:', window.RENDER_API_URL, '-> normalized:', normalized);
        return normalized || 'https://kns-college-website.onrender.com';
    }
    
    // Check localStorage for custom API URL (useful for production debugging)
    // NOTE: Clear localStorage if it has an old/incorrect URL
    try {
        const storedApiUrl = localStorage.getItem('API_BASE_URL');
        if (storedApiUrl) {
            const normalized = normalizeApiUrl(storedApiUrl);
            // If the stored URL is not the correct Render URL, clear it and use default
            if (normalized && !normalized.includes('kns-college-website.onrender.com')) {
                console.warn('Stored API_BASE_URL is not the Render backend. Clearing and using default.');
                localStorage.removeItem('API_BASE_URL');
            } else if (normalized) {
                console.log('Using localStorage API_BASE_URL:', storedApiUrl, '-> normalized:', normalized);
                return normalized;
            }
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
    
    // Frontend is on www.kns.edu.sl or other domain - use Render backend
    // Explicitly check for the production frontend domain
    if (currentOrigin.includes('kns.edu.sl') || currentOrigin.includes('www.kns.edu.sl')) {
        const renderBackendUrl = 'https://kns-college-website.onrender.com';
        console.log('Frontend on kns.edu.sl domain, using Render backend:', renderBackendUrl);
        return renderBackendUrl;
    }
    
    // Fallback: Frontend is on other domain - use Render backend
    const renderBackendUrl = 'https://kns-college-website.onrender.com';
    console.log('Frontend on different domain, using Render backend:', renderBackendUrl);
    return renderBackendUrl;
}

// Calculate API base URL
let calculatedApiBaseUrl = getApiBaseUrl();

// Validate and fix the calculated URL
if (!calculatedApiBaseUrl.startsWith('http://') && !calculatedApiBaseUrl.startsWith('https://')) {
    console.warn('Calculated API URL missing protocol, fixing...');
    calculatedApiBaseUrl = normalizeApiUrl(calculatedApiBaseUrl) || 'https://kns-college-website.onrender.com';
}

// Log configuration for debugging
console.log('=== CONFIG.JS Loaded ===');
console.log('Current hostname:', window.location.hostname);
console.log('Current origin:', window.location.origin);
console.log('Calculated API Base URL:', calculatedApiBaseUrl);
console.log('========================');

// Utility function to reset API URL (can be called from browser console)
if (typeof window !== 'undefined') {
    window.resetApiUrl = function() {
        try {
            localStorage.removeItem('API_BASE_URL');
            console.log('API_BASE_URL cleared from localStorage. Reload the page to use default.');
        } catch (e) {
            console.error('Could not clear localStorage:', e);
        }
    };
    console.log('Utility function available: window.resetApiUrl() - Call this to clear incorrect API URL from localStorage');
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
    API_BASE_URL: calculatedApiBaseUrl,
    
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

