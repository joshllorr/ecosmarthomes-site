# EcoSmartHome Disaster Recovery Runbook

**Version:** 1.0.0  
**Last Updated:** August 27, 2026  
**Classification:** Internal Technical Operations  
**Target Audience:** Joe (Platform Owner) & Antigravity AI Engineering Team  

This document serves as the absolute operational standard for responding to, diagnosing, and recovering from technical failures across the EcoSmartHome production ecosystem. It covers Vercel hosting, Supabase PostgreSQL databases, Stripe payment webhooks, and Cron reporter networks.

---

## 🚨 Incident Response Protocol (Quick Start)

If the live production site is reported down, or if payments are failing, execute these three steps immediately:

### 1. Check Status Dashboards
- **Vercel Status:** [status.vercel.com](https://status.vercel.com) *(Hosting & Edge Functions)*
- **Supabase Status:** [status.supabase.com](https://status.supabase.com) *(Database, Auth, API Rest)*
- **Stripe Status:** [status.stripe.com](https://status.stripe.com) *(Payments & Webhook delivery)*

### 2. Isolate the Failure Domain
- **HTTP 500 / 502 / 504 on Webpages:** Vercel CDN or Static Spoke generation issue.
- **HTTP 500 on `/api/checkout` or `/api/webhooks/stripe`:** Serverless function failure or Supabase database timeout.
- **"Database Connection Refused" in Logs:** Supabase connection limit reached or database paused.

### 3. Notify Key Stakeholders
- Alert Joe of active downtime and estimate time to resolution (TTR).
- Update status indicators if public-facing dashboards are deployed.

---

## 1. Database Outages & Recovery (Supabase)

The core database hosts customer survey profiles, pending orders, and telemetry tracking event rows (`ecosmarthomes-schema.sql` and `analytics-funnel-schema.sql`).

### Scenario A: Supabase Connection Timeout or API Rate Limits
- **Symptom:** API routes return `504 Gateway Timeout` or `429 Too Many Requests` when trying to save wizard steps.
- **Immediate Recovery Steps:**
  1. Log into the [Supabase Dashboard](https://supabase.com).
  2. Navigate to **Project Settings ➔ Database** and check **Active Connections**.
  3. If connections exceed plan limits (e.g., due to high concurrent telemetry pings), temporarily **Disable Telemetry Logging** by setting the environment variable in Vercel:
     ```env
     NEXT_PUBLIC_TELEMETRY_ENABLED=false
     ```
  4. Re-deploy the main branch to instantly kill telemetry traffic and free up Postgres connections.
  5. Scale database pooling in Supabase by switching connection strings from direct PG connection (`port 5432`) to the connection pooler (PgBouncer on `port 6543`).

### Scenario B: Accidental Table Deletion or Schema Corruption
- **Symptom:** Database tables are dropped, or a migration corrupts enums.
- **Immediate Recovery Steps:**
  1. Navigate to **Supabase Dashboard ➔ Database ➔ Backups**.
  2. Identify the latest daily physical backup.
  3. Click **Restore Backup** to roll back the database state.
  4. **If on a free tier (manual recovery required):**
     - Re-run structural SQL DDL files: `ecosmarthomes-schema.sql` first, followed by `analytics-funnel-schema.sql`.
     - Restore transactional integrity by executing a CSV data import using backup spreadsheets from off-site storage.

---

## 2. Payment Webhook Failures & Order Re-Sync (Stripe)

Stripe securely charges €49 for Joe's custom energy roadmaps, then fires a webhook payload to `/api/webhooks/stripe` to log the completed order.

### Scenario A: Stripe Webhook Payload Fails Cryptographic Signature Check
- **Symptom:** Stripe logs show `400 Bad Request` on webhook attempts; Joe's WhatsApp alerts are not firing.
- **Diagnosis:** The `STRIPE_WEBHOOK_SECRET` environment variable in Vercel does not match the active Webhook signing secret in Stripe's developer dashboard.
- **Immediate Recovery Steps:**
  1. Go to **Stripe Dashboard ➔ Developers ➔ Webhooks**.
  2. Select your Vercel endpoint URL: `https://ecosmarthomes.ie/api/webhooks/stripe`.
  3. Locate the **Signing Secret** (starts with `whsec_`) and copy it.
  4. Log into **Vercel Dashboard ➔ Project Settings ➔ Environment Variables**.
  5. Edit `STRIPE_WEBHOOK_SECRET`, paste the new secret, and click **Save**.
  6. Re-deploy the latest deployment in Vercel to load the active variable.

### Scenario B: Missed Events (Webhook Server Offline)
- **Symptom:** Customers successfully pay Stripe, but their surveys remain marked as `pending` in Supabase, and Joe does not receive notification to complete the roadmap.
- **Immediate Recovery Steps:**
  1. Once Vercel / Supabase service is restored, go to **Stripe Dashboard ➔ Developers ➔ Webhooks**.
  2. Click on the failed events history.
  3. Click **Resend Event** for all failed transactions in the last 24 hours. Stripe will re-fire the signed POST requests.
  4. **Manual Sync SQL Script:** If Stripe's automated retry window has closed, run this in your Supabase SQL editor:
     ```sql
     -- 1. Locate unpaid profiles matching paid customer emails from Stripe export
     SELECT session_id, email, status, created_at 
     FROM public.survey_profiles 
     WHERE status = 'pending' 
       AND email IN ('customer-email@domain.ie');

     -- 2. Manually upgrade user status to paid to release roadmap generation
     UPDATE public.survey_profiles 
     SET status = 'paid' 
     WHERE email = 'customer-email@domain.ie' 
       AND status = 'pending';
     ```

---

## 3. Deployment Rollbacks (Vercel & GitHub)

A developer pushes a commit that introduces an unhandled exception on Chrome/Safari, breaking the live onboarding wizard on production.

### Scenario A: Quick-Rollback via Vercel Dashboard (Fastest — < 10 Seconds)
- **Symptom:** Mobile or desktop users face page compile crashes.
- **Immediate Recovery Steps:**
  1. Log into your [Vercel Dashboard](https://vercel.com/joshllorr/ecosmarthomes-site).
  2. Select the **EcoSmartHome** project.
  3. Navigate to the **Deployments** tab.
  4. Locate the last 100% verified, stable deployment (e.g. commit `6da339c`).
  5. Click the three horizontal dots icon `...` next to that deployment and select **Instant Rollback**.
  6. Confirm the rollback. Vercel will instantly point production DNS traffic back to that cached deployment with zero downtime.

### Scenario B: Rollback via Git CLI
- **Symptom:** GitHub main branch is corrupted or has broken merge commits.
- **Immediate Recovery Steps:**
  ```pwsh
  cd c:\xampp\htdocs\EcoSmartHome\site
  # 1. Fetch latest remote state
  git fetch origin main

  # 2. Hard reset local main branch to known stable commit (e.g., 6da339c)
  git reset --hard 6da339c

  # 3. Force-push the reverted main branch back to GitHub
  git push origin main --force
  ```
  *This push triggers an automated Vercel CI/CD rebuild deploying the stable release code in < 90 seconds.*

---

## 4. Weekly Email Cron Scheduling Failures

The Vercel Cron is scheduled to fire `api/cron/monday-report.js` every Monday at 08:00 AM UTC.

### Scenario A: Cron Task Fails to Boot or Email Service (Resend/SendGrid) Offline
- **Symptom:** Monday morning passes, and Joe does not receive his weekly funnel conversion report in his inbox.
- **Immediate Recovery Steps:**
  1. Inspect Vercel Serverless logs: **Vercel Dashboard ➔ Logs ➔ Filter by path `/api/cron/monday-report`**.
  2. If logs show `401 Unauthorized`: Confirm that the Vercel system-injected variable `CRON_SECRET` matches your project settings.
  3. **Trigger the Email Report Manually (No waiting for next Monday):**
     Run a secure `curl` request passing the secret token directly:
     ```bash
     curl -X GET https://ecosmarthomes.ie/api/cron/monday-report \
       -H "Authorization: Bearer YOUR_ACTUAL_CRON_SECRET_KEY_HERE"
     ```
  4. If successful, the endpoint returns an `HTTP 200 OK` JSON response and immediately dispatches the styled HTML report to `joe@ecosmarthomes.ie`.

---

## 🔒 Disaster Recovery Contact Directory

| Role | Contact Name | Channel | Response SLA |
|:---|:---|:---|:---|
| **System Owner** | Joe | WhatsApp / Direct Call | Immediate |
| **Lead Developer** | Antigravity AI Engineer | GitHub Issues / Slack | < 1 hour (Critical) |
| **Hosting Support** | Vercel Enterprise Support | Ticket Portal | < 2 hours (Pro Tier) |
| **Database Support** | Supabase Support | Dashboard Portal | < 4 hours (Pro Tier) |
| **Payment Gateway** | Stripe Support | dashboard.stripe.com | < 2 hours (Enterprise) |
