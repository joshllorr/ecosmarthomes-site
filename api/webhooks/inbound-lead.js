/**
 * /api/webhooks/inbound-lead.js
 * Dedicated Webhook Receiver for Make / Zapier / Formspree Inbound Payloads
 */
import contactHandler from '../contact.js';

export default async function handler(req, res) {
  return contactHandler(req, res);
}
