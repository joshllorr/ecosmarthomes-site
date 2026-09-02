# EcoSmartHome: Automated Webhook & Data Integration Architecture (v1.0)
Target Audience: Antigravity AI Engineering Team & Joe

This technical specification maps the end-to-end data flow, API payloads, and security protocols required to connect the frontend React onboarding wizard (`OnboardingWizard.jsx`), Stripe's secure payment pipeline, and Joe's automated WhatsApp delivery webhook.

---

## 1. System Architecture Overview
To maintain a zero-friction, lightning-fast static frontend (System 1 execution), the architecture offloads state storage and payment processing to a lightweight serverless backend (e.g., Next.js API Routes, Vercel Functions, or Node.js endpoints).

```
┌────────────────────────┐      (1) Initiate checkout with metadata
│   OnboardingWizard     │ ──────────────────────────────────────┐
│  (React Client State)  │                                       │
└────────────────────────┘                                       ▼
            ▲                                         ┌─────────────────────┐
            │ (6) Success Redirect                    │  Stripe Hosted API  │
            │                                         │  (Stripe Checkout)  │
            │                                         └─────────────────────┘
┌────────────────────────┐                                       │
│   WhatsApp Business    │                                       │ (2) fires webhook event:
│    (Joe & Customer)    │                                       │     checkout.session.completed
└────────────────────────┘                                       ▼
            ▲                                         ┌─────────────────────┐
            │                                         │ Backend API Route   │
            │ (5) Send template notifications         │ /api/webhooks/stripe│
            └──────────────────────────────────────── └─────────────────────┘
                                                                 │
                                                                 │ (3) Verify signature &
                                                                 │     extract custom metadata
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │ PostgreSQL Database │
                                                      │  (Orders & Surveys) │
                                                      └─────────────────────┘
                                                                 │
                                                                 │ (4) Generate dynamic PDF &
                                                                 │     queue WhatsApp webhook
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │  WhatsApp API Queue │
                                                      │  (Twilio / Meta)    │
                                                      └─────────────────────┘
```

---

## 2. Step-by-Step Data Lifecycle

### Step 1: React Client State Packaging
When the homeowner clicks the "Order Assessment for €49" button, the React client compiles all local state variables from the Onboarding Wizard into a structured payload.

```javascript
// State structure compiled on client
const checkoutPayload = {
  property_profile: {
    archetype: "semi-detached", // detached, semi-detached, terraced, apartment
    ber_start: "D2",            // A through G
  },
  financials: {
    annual_heating_bill: 3800,  // Slider input value
    estimated_savings: 3150,    // Calculated based on BER matrix
    eligible_grants: 13500      // Up to €25,500 SEAI calculations
  },
  scanner_data: {
    boiler_image_url: "https://ecosmarthomes-uploads.s3.amazonaws.com/temp/session_abc123.jpg",
    sr50_viability: "pass"
  },
  customer: {
    full_name: "Seán O'Connor",
    phone_number: "+353839662197", // E.164 formatting
    email: "sean.oconnor@example.ie",
    county: "Cork"
  }
};
```

### Step 2: Stripe Session Creation with Metadata
The client transmits this payload to your serverless endpoint `/api/checkout/create-session`. The backend creates a secure Stripe Checkout Session and injects the survey answers directly into Stripe’s metadata object.

```javascript
// Server-Side: Node.js stripe endpoint
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { property_profile, financials, scanner_data, customer } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Independent Retrofit Roadmap & Survey',
          description: 'Conflict-Free Energy Assessment completed by Joe.',
        },
        unit_amount: 4900, // €49.00 in cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://www.ecosmarthomes.ie/checkout/thank-you?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://www.ecosmarthomes.ie/checkout',
    customer_email: customer.email,
    // CRITICAL: Metadata persistence (Max 50 keys, values max 500 chars)
    metadata: {
      customer_name: customer.full_name,
      customer_phone: customer.phone_number,
      customer_county: customer.county,
      property_archetype: property_profile.archetype,
      ber_start: property_profile.ber_start,
      annual_bill: financials.annual_heating_bill,
      estimated_savings: financials.estimated_savings,
      eligible_grants: financials.eligible_grants,
      boiler_image: scanner_data.boiler_image_url
    }
  });

  res.status(200).json({ id: session.id, url: session.url });
}
```

### Step 3: Hardened Webhook Listener (`/api/webhooks/stripe`)
Once the payment is validated, Stripe's systems dispatch an asynchronous `checkout.session.completed` POST request to your webhook listener.

**Webhook Core Security Requirements:**
1. **Signature Verification**: The endpoint must verify the signature header (`stripe-signature`) against your production `STRIPE_WEBHOOK_SECRET` using Stripe's SDK.
2. **Idempotency Check**: The database checks incoming `evt_id` to prevent duplicate processing.

```javascript
// Webhook handler validating payment status
import { buffer } from 'micro';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

export default async function webhookHandler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const surveyData = session.metadata;

    // 1. Persist the official transaction & survey state to database
    await saveOrderToDatabase(session.id, surveyData);

    // 2. Queue automated background jobs
    await triggerWhatsAppNotifications(surveyData);
  }

  res.json({ received: true });
}
```

---

## 3. WhatsApp Automated Webhooks (Meta / Twilio Integration)

### Webhook A: Notification to Joe (The Advisor)
Fires immediately to alert Joe that a new survey has been ordered, passing the survey details and Gemini scanner photo link straight to his phone.

- **API Endpoint**: `https://graph.facebook.com/v18.0/{{JOE_PHONE_NUMBER_ID}}/messages`
- **Authorization**: `Bearer token (META_PERMANENT_ACCESS_TOKEN)`

```json
{
  "messaging_product": "whatsapp",
  "to": "+35387XXXXXXX",
  "type": "template",
  "template": {
    "name": "new_survey_alert_v1",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Seán O'Connor" },
          { "type": "text", "text": "Cork" },
          { "type": "text", "text": "D2" },
          { "type": "text", "text": "€3,800/yr" },
          { "type": "text", "text": "https://ecosmarthomes-uploads.s3.amazonaws.com/temp/session_abc123.jpg" }
        ]
      }
    ]
  }
}
```

### Webhook B: Receipt & Immediate Estimation to Customer
Sends a polite confirmation to the homeowner, solidifying trust and outlining the €25,500 grant savings they are on track to unlock while Joe reviews their blueprint.

```json
{
  "messaging_product": "whatsapp",
  "to": "+353839662197",
  "type": "template",
  "template": {
    "name": "customer_onboarding_receipt",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Seán" },
          { "type": "text", "text": "€13,500" },
          { "type": "text", "text": "€3,150" }
        ]
      }
    ]
  }
}
```

---

## 4. Disaster Recovery & Edge Cases

1. **User Drops Off During Stripe Redirect**:
   - The frontend generates a unique draft ID at Step 1 and writes questionnaire state to your database. If no Stripe webhook confirmation is received within 24 hours, a gentle follow-up sequence is triggered.
2. **Missing Boiler Photo in Scanner Stage**:
   - Metadata flags `boiler_image: "none"`. Webhook A adjusts Joe's WhatsApp template to state: *"No image uploaded—request attic/boiler photo on survey call."*
3. **Invalid Phone Number Formats**:
   - `OnboardingWizard.jsx` enforces international E.164 format (`+353...`) before unlocking Step 5 to guarantee WhatsApp delivery.
