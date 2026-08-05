/**
 * EcoSmartHomes Developer Token Generator with Unique Token ID & Registry Sync
 * Usage: node scripts/generate-dev-token.js [tokenId] [secret]
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const tokenId = process.argv[2] || `dev-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90) + 10)}`;
const secret = process.argv[3] || process.env.DEV_TOKEN_SECRET || 'ecosmart-dev-secret-2026-key';

const issuedAt = Math.floor(Date.now() / 1000);
const expiresAt = issuedAt + (365 * 24 * 60 * 60); // 1 year expiry

const payload = {
  id: tokenId,
  role: 'developer',
  scope: ['ai.dev', 'schema.read', 'diagnostics'],
  issued: issuedAt,
  expires: expiresAt
};

const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
const hmac = crypto.createHmac('sha256', secret);
hmac.update(payloadB64);
const signatureB64 = hmac.digest('base64url');

const token = `${payloadB64}.${signatureB64}`;

// Sync token to site/data/dev-tokens.json
const registryPath = path.join(__dirname, '../site/data/dev-tokens.json');
try {
  let registry = { active: [], revoked: [] };
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }
  
  if (!registry.active.some(item => item.id === tokenId)) {
    registry.active.push({
      id: tokenId,
      label: `Partner Token (${tokenId})`,
      issued: issuedAt,
      expires: expiresAt
    });
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    console.log(`✅ Synced token [${tokenId}] to active registry in site/data/dev-tokens.json`);
  }
} catch (e) {
  console.warn('Could not sync registry:', e.message);
}

console.log('====================================================');
console.log('🌿 EcoSmartHomes Developer Access Token Generated');
console.log('====================================================');
console.log('Token ID    :', tokenId);
console.log('Token Secret:', secret);
console.log('Token Value :', token);
console.log('Payload     :', JSON.stringify(payload, null, 2));
console.log('====================================================');
console.log('Usage in Headers : ecosmart-dev-token: ' + token);
console.log('Usage in Browser : https://ecosmarthomes.ie/ai/dev/?token=' + token);
console.log('====================================================');
