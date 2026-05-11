/**
 * Example: create a Monime Checkout Session from your server (Node 18+).
 * Per Monime docs: https://docs.monime.io/developer-resources/api-basics
 * Create session API: https://docs.monime.io/apis/versions/caph-2025-08-23/checkout-session/create-checkout-session.md
 *
 * Environment (never commit real secrets):
 *   MONIME_ACCESS_TOKEN   Bearer token (mon_test_* or mon_*)
 *   MONIME_SPACE_ID       e.g. spc-xxxxxxxx
 *
 * Install: none (uses global fetch). Run with: node monime-create-session.example.js
 * Production: POST /api/monime/checkout-session on server.js proxies here (see checkout.js + checkout.html).
 */

const { randomUUID } = require("crypto");

const MONIME_ACCESS_TOKEN = process.env.MONIME_ACCESS_TOKEN || "";
const MONIME_SPACE_ID = process.env.MONIME_SPACE_ID || "";

async function demoCreateSession() {
    if (!MONIME_ACCESS_TOKEN || !MONIME_SPACE_ID) {
        console.error("Set MONIME_ACCESS_TOKEN and MONIME_SPACE_ID env vars.");
        process.exit(1);
    }

    const idempotencyKey = randomUUID();
    const body = {
        name: "KNS College — Online course enrollment",
        description: "Example checkout session for documentation",
        reference: "kns-demo-" + Date.now(),
        successUrl: "https://example.com/checkout-success.html?course=Example&price=NLe%201000",
        cancelUrl: "https://example.com/checkout-cancelled.html?course=Example&price=NLe%201000",
        lineItems: [
            {
                type: "custom",
                name: "Course enrollment (example)",
                quantity: 1,
                price: { currency: "SLE", value: 100000 }
            }
        ],
        paymentOptions: {
            momo: { enabledProviders: ["m17", "m18"] }
        },
        brandingOptions: {
            primaryColor: "#1a4d7a"
        },
        metadata: {
            source: "kns-college-static-example"
        }
    };

    const res = await fetch("https://api.monime.io/v1/checkout-sessions", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + MONIME_ACCESS_TOKEN,
            "Monime-Space-Id": MONIME_SPACE_ID,
            "Monime-Version": "caph.2025-08-23",
            "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(body)
    });

    const json = await res.json().catch(() => ({}));
    console.log(res.status, json);
}

demoCreateSession().catch((e) => {
    console.error(e);
    process.exit(1);
});
