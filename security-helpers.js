const crypto = require('crypto');
const path = require('path');
const net = require('net');

const APPLICATION_FEE_SLE = 250;

const SCHOLARSHIP_FILE_ALLOWED_HOSTS = new Set([
    'kns.edu.sl',
    'www.kns.edu.sl',
    'kns-college-website.onrender.com'
]);

function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtmlWithBreaks(value) {
    if (value == null) return '';
    return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>');
}

function getPaymentStatusSecret() {
    const explicit = (process.env.PAYMENT_STATUS_SECRET || '').trim();
    if (explicit) return explicit;
    const monime = (process.env.MONIME_ACCESS_TOKEN || '').trim();
    if (monime) return crypto.createHash('sha256').update('kns-payment:' + monime).digest('hex');
    return crypto.createHash('sha256').update('kns-payment-dev-only').digest('hex');
}

function createPaymentStatusToken(paymentId, paymentReference) {
    return crypto
        .createHmac('sha256', getPaymentStatusSecret())
        .update(String(paymentId) + ':' + String(paymentReference))
        .digest('hex');
}

function verifyPaymentStatusToken(paymentId, paymentReference, token) {
    if (!token || typeof token !== 'string') return false;
    const expected = createPaymentStatusToken(paymentId, paymentReference);
    try {
        return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(token, 'utf8'));
    } catch {
        return false;
    }
}

function createRequireAdminApiKey(adminApiKey) {
    return function requireAdminApiKey(req, res, next) {
        if (!adminApiKey) {
            return res.status(503).json({
                error: 'Admin API is not configured',
                message: 'Set KNS_ADMIN_API_KEY on the server to access this endpoint.'
            });
        }
        const headerKey = req.get('x-admin-api-key') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
        if (!headerKey || headerKey !== adminApiKey) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };
}

function isPrivateOrReservedIp(ip) {
    if (!ip) return true;
    const normalized = ip.replace(/^\[|\]$/g, '');
    if (normalized === 'localhost') return true;
    const mapped = normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
    const kind = net.isIP(mapped);
    if (kind === 4) {
        const parts = mapped.split('.').map(Number);
        if (parts[0] === 10) return true;
        if (parts[0] === 127) return true;
        if (parts[0] === 169 && parts[1] === 254) return true;
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        if (parts[0] === 192 && parts[1] === 168) return true;
        if (parts[0] === 0) return true;
        return false;
    }
    if (kind === 6) {
        const lower = mapped.toLowerCase();
        if (lower === '::1') return true;
        if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
        if (lower.startsWith('fe80')) return true;
    }
    return false;
}

function isAllowedScholarshipFileUrl(urlStr) {
    try {
        const u = new URL(urlStr);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
        const host = u.hostname.toLowerCase();
        if (isPrivateOrReservedIp(host)) return false;
        if (host.endsWith('.supabase.co')) return true;
        if (SCHOLARSHIP_FILE_ALLOWED_HOSTS.has(host)) return true;
        if (host.endsWith('.kns.edu.sl')) return true;
        return false;
    } catch {
        return false;
    }
}

function resolveScholarshipFilePath(baseDir, relativePath) {
    const scholarshipsRoot = path.resolve(baseDir, 'scholarships');
    const cleanPath = String(relativePath || '')
        .replace(/^\/+/, '')
        .replace(/^scholarships\//, '')
        .replace(/\.\.(\/|\\)/g, '');
    const fullPath = path.resolve(scholarshipsRoot, cleanPath);
    if (!fullPath.startsWith(scholarshipsRoot + path.sep) && fullPath !== scholarshipsRoot) {
        return null;
    }
    return fullPath;
}

module.exports = {
    APPLICATION_FEE_SLE,
    escapeHtml,
    escapeHtmlWithBreaks,
    createPaymentStatusToken,
    verifyPaymentStatusToken,
    createRequireAdminApiKey,
    isAllowedScholarshipFileUrl,
    resolveScholarshipFilePath
};
