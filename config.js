/**
 * API base URL resolution — see getApiBaseUrl() and CONFIG.API_BASE_URL.
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

const KNS_DEFAULT_RENDER_API = 'https://kns-college-website.onrender.com';

function isAllowedStoredApiBaseUrl(normalized) {
    if (!normalized) return false;
    if (normalized.includes('kns-college-website.onrender.com')) return true;
    if (/^https?:\/\/localhost(?::\d+)?(\/|$)/i.test(normalized)) return true;
    if (/^https?:\/\/127\.0\.0\.1(?::\d+)?(\/|$)/i.test(normalized)) return true;
    return false;
}

function wantsLocalNodeApi() {
    if (typeof window === 'undefined') return false;
    if (window.KNS_USE_LOCAL_API === true) return true;
    try {
        return localStorage.getItem('KNS_USE_LOCAL_API') === '1';
    } catch (e) {
        return false;
    }
}

function getApiBaseUrl() {
    // file:// has empty hostname — use deployed API (not localhost).
    const isLoopbackHost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1) Explicit script override (always wins)
    if (typeof window !== 'undefined' && window.RENDER_API_URL) {
        const normalized = normalizeApiUrl(window.RENDER_API_URL);
        return normalized || KNS_DEFAULT_RENDER_API;
    }

    // 2) localStorage override: Render URL or http://localhost:PORT / 127.0.0.1 for full-stack dev
    try {
        const storedApiUrl = localStorage.getItem('API_BASE_URL');
        if (storedApiUrl) {
            const normalized = normalizeApiUrl(storedApiUrl);
            if (normalized && isAllowedStoredApiBaseUrl(normalized)) {
                return normalized.replace(/\/+$/, '');
            }
            console.warn('Stored API_BASE_URL is not allowed (use Render URL or http://localhost:PORT). Clearing.');
            localStorage.removeItem('API_BASE_URL');
        }
    } catch (e) {
        // localStorage might not be available
    }

    // 3) Loopback: Live Server / other ports → Render API. Same-origin Node (e.g. npm start on :3000) → use that origin.
    const currentOrigin = window.location.origin;
    if (isLoopbackHost) {
        if (wantsLocalNodeApi()) {
            return 'http://localhost:3000';
        }
        const bundledLocal =
            /^http:\/\/(localhost|127\.0\.0\.1):3000$/i.test(currentOrigin);
        if (bundledLocal) {
            return currentOrigin;
        }
        return KNS_DEFAULT_RENDER_API;
    }

    // 4) Backend and frontend on same Render host
    if (currentOrigin.includes('onrender.com') || currentOrigin.includes('kns-college-website')) {
        return currentOrigin;
    }

    // 5) Production college site (or any other host): call Render API
    if (currentOrigin.includes('kns.edu.sl') || currentOrigin.includes('www.kns.edu.sl')) {
        return KNS_DEFAULT_RENDER_API;
    }

    return KNS_DEFAULT_RENDER_API;
}

// Calculate API base URL
let calculatedApiBaseUrl = getApiBaseUrl();

// Validate and fix the calculated URL
if (!calculatedApiBaseUrl.startsWith('http://') && !calculatedApiBaseUrl.startsWith('https://')) {
    console.warn('Calculated API URL missing protocol, fixing...');
    calculatedApiBaseUrl = normalizeApiUrl(calculatedApiBaseUrl) || KNS_DEFAULT_RENDER_API;
}

if (typeof window !== 'undefined') {
    try {
        const h = window.location.hostname;
        if (h === 'localhost' || h === '127.0.0.1') {
            console.info('[KNS] API requests use: ' + calculatedApiBaseUrl);
            if (/localhost:3000|127\.0\.0\.1:3000/.test(calculatedApiBaseUrl)) {
                console.info(
                    '[KNS] For local API: run `npm start` in the project folder (needs .env.local with Supabase). ' +
                        'If you only want the hosted API, run resetApiUrl() then reload, or remove KNS_USE_LOCAL_API from localStorage.'
                );
            }
        }
    } catch (e) {
        /* ignore */
    }
}

// Configuration loaded

// Utility function to reset API URL (can be called from browser console)
if (typeof window !== 'undefined') {
    window.resetApiUrl = function() {
        try {
            localStorage.removeItem('API_BASE_URL');
            localStorage.removeItem('KNS_USE_LOCAL_API');
            // Cleared API_BASE_URL and KNS_USE_LOCAL_API. Reload to apply defaults.
        } catch (e) {
            console.error('Could not clear localStorage:', e);
        }
    };
    // window.resetApiUrl() — clears API_BASE_URL and KNS_USE_LOCAL_API, then reload the page.
}

const CONFIG = {
    /**
     * API Base URL Configuration
     * - Live Server / http://localhost (HTML only): uses Render API by default (same as production).
     * - Local full-stack: before config.js, set window.KNS_USE_LOCAL_API = true, or
     *   localStorage.setItem('KNS_USE_LOCAL_API','1'), or localStorage.setItem('API_BASE_URL','http://localhost:3000'),
     *   then run npm start for the Express API on port 3000.
     * - Production on Render: window.location.origin when frontend and backend are together.
     * - kns.edu.sl: https://kns-college-website.onrender.com
     * - Override: window.RENDER_API_URL or localStorage API_BASE_URL (Render or localhost URLs only).
     */
    API_BASE_URL: calculatedApiBaseUrl,
    
    /**
     * Production API URL
     * The deployed backend server URL for production environments
     */
    PRODUCTION_API_URL: 'https://kns-college-website.onrender.com',
    
    ENDPOINTS: {
        MESSAGES: '/api/messages',
        CONTACTS: '/api/contacts',
        ENQUIRIES: '/api/enquiries',
        ENROLLMENTS: '/api/enrollments',
        PAYMENTS: '/api/payments',
        SCHOLARSHIPS: '/api/scholarships',
        SCHOLARSHIP_APPLICATIONS: '/api/scholarship-applications',
        STATS: '/api/stats',
        HEALTH: '/api/health',
        /**
         * Monime: your backend should expose POST here and proxy to
         * https://api.monime.io/v1/checkout-sessions (never call Monime with a secret token from the browser).
         * See monime-create-session.example.js in this project for a reference implementation.
         */
        MONIME_CHECKOUT_SESSION: '/api/monime/checkout-session',
        ONLINE_COURSES: '/api/online-courses',
        ONLINE_COURSE_RATINGS: '/api/online-course-ratings'
    },

    /** Line item sent to Monime uses SLE minor units (100 = SLE 1.00 per Monime docs). NLe 1000 → 100000. */
    CHECKOUT_AMOUNT_SLE_MINOR: 100000,

    CHECKOUT_CURRENCY: 'SLE',

    /** Shown on checkout and appended when users click Enroll (must match card pricing). */
    CHECKOUT_DISPLAY_PRICE: 'NLe 1000',

    /** Join API base URL with a path (avoids double slashes). */
    buildApiUrl: function (path) {
        const base = (this.API_BASE_URL || '').replace(/\/+$/, '');
        const p = typeof path === 'string' && path.startsWith('/') ? path : '/' + (path || '');
        return base + p;
    }
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

