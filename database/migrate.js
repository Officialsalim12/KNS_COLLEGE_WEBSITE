(function loadEnvForMigrate() {
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
        console.error('DATABASE_URL is not set. Add it to .env.local or Render env vars.');
        process.exit(1);
    }
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database/schema.sql...');
    await query(sql);
    console.log('Migration complete.');
    await closePool();
}

main().catch(async (err) => {
    console.error('Migration failed:', err.message);
    await closePool();
    process.exit(1);
});
