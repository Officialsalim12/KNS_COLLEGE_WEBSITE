(function loadEnv() {
    const fs = require('fs');
    const path = require('path');
    const root = path.join(__dirname, '..');
    for (const name of ['.env.local', '.env', '.env.production']) {
        const full = path.join(root, name);
        if (fs.existsSync(full)) {
            require('dotenv').config({ path: full });
            break;
        }
    }
})();

const fs = require('fs');
const path = require('path');
const { query, isDbConfigured, closePool } = require('./pg');

async function main() {
    if (!isDbConfigured()) {
        console.error('DATABASE_URL is not set.');
        process.exit(1);
    }
    const sql = fs.readFileSync(path.join(__dirname, 'seed-online-courses.sql'), 'utf8');
    console.log('Seeding production online course catalog...');
    await query(sql);
    console.log('Seed complete.');
    await closePool();
}

main().catch(async (err) => {
    console.error('Seed failed:', err.message);
    await closePool();
    process.exit(1);
});
