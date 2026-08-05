/**
 * EcoSmartHomes Developer Token Generator
 * Usage: node scripts/generate-dev-token.js [secret]
 */
const crypto = require('crypto');

const secret = process.argv[2] || process.env.DEV_TOKEN_SECRET || 'ecosmart-dev-secret-2026-key';

const payload = {
  role: 'developer',
  scope: ['ai.dev', 'schema.read', 'diagnostics'],
  issued: Math.floor(Date.now() / 1000),
  expires: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year expiry
};

const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
const hmac = crypto.createHmac('sha256', secret);
hmac.update(payloadB64);
const signatureB64 = hmac.digest('base64url');

const token = `${payloadB64}.${signatureB64}`;

console.log('====================================================');
console.log('🌿 EcoSmartHomes Developer Access Token Generated');
console.log('====================================================');
console.log('Token Secret:', secret);
console.log('Token Value :', token);
console.log('Payload     :', JSON.stringify(payload, null, 2));
console.log('====================================================');
console.log('Usage in Headers : ecosmart-dev-token: ' + token);
console.log('Usage in Browser : https://ecosmarthomes.ie/ai/dev/?token=' + token);
console.log('====================================================');
