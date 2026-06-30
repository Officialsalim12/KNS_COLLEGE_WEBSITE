const { Pool } = require('pg');

const DATABASE_URL = (process.env.DATABASE_URL || '').trim();

let pool = null;

function isDbConfigured() {
    return Boolean(DATABASE_URL);
}

function getPool() {
    if (!DATABASE_URL) {
        return null;
    }
    if (!pool) {
        const useSsl =
            process.env.PGSSLMODE === 'require' ||
            /render\.com|neon\.tech|railway\.app|supabase\.co/i.test(DATABASE_URL);
        pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: useSsl ? { rejectUnauthorized: false } : undefined,
            max: parseInt(process.env.PG_POOL_MAX || '10', 10)
        });
        pool.on('error', (err) => {
            console.error('PostgreSQL pool error:', err.message);
        });
    }
    return pool;
}

async function query(text, params) {
    const p = getPool();
    if (!p) {
        throw new Error('DATABASE_URL is not set');
    }
    return p.query(text, params);
}

function isMissingRelation(err) {
    return Boolean(err && err.code === '42P01');
}

async function initDatabase() {
    if (!isDbConfigured()) {
        console.warn('DATABASE_URL is not set — API data routes will return 503 until configured.');
        return;
    }
    console.log('Testing PostgreSQL connection...');
    await query('SELECT 1 AS ok');
    try {
        await query('SELECT id FROM messages LIMIT 1');
        console.log('Connected to PostgreSQL successfully');
    } catch (err) {
        if (isMissingRelation(err)) {
            console.log('PostgreSQL connected (run npm run db:migrate to create tables)');
        } else {
            throw err;
        }
    }
}

async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

module.exports = {
    query,
    getPool,
    isDbConfigured,
    initDatabase,
    isMissingRelation,
    closePool
};
