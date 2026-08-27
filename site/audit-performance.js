/**
 * EcoSmartHome Performance Audit Suite (Lighthouse CLI Programmatic Runner)
 * 
 * This script automates running Google Lighthouse audits against your local development server
 * or your live Vercel staging/production URLs. It runs audits for both MOBILE and DESKTOP profiles,
 * extracts Core Web Vitals (LCP, CLS, TBT, FCP, TTFB), and prints a clean, color-coded terminal
 * scorecard while saving high-fidelity HTML and JSON reports.
 * 
 * Prerequisites:
 *   npm install lighthouse chrome-launcher chalk
 * 
 * Run locally or in CI:
 *   node audit-performance.js <target-url>
 *   e.g., node audit-performance.js https://ecosmarthomes-site.vercel.app
 */

const fs = require('fs');
const path = require('path');

// Dynamically import ES modules safely if running in standard Node env
async function runAudit() {
  // Setup colors fallback in case chalk is missing or running in minimal CI env
  let chalk;
  try {
    chalk = require('chalk');
  } catch (e) {
    // Fallback minimal chalk proxy to avoid script crashes if not installed yet
    const identity = (str) => str;
    chalk = {
      green: identity, greenBold: identity, red: identity, yellow: identity, 
      cyan: identity, gray: identity, bold: identity, underline: identity,
      bgGreen: identity, bgRed: identity, bgYellow: identity, black: identity
    };
    chalk.green = (s) => `\x1b[32m${s}\x1b[0m`;
    chalk.red = (s) => `\x1b[31m${s}\x1b[0m`;
    chalk.yellow = (s) => `\x1b[33m${s}\x1b[0m`;
    chalk.cyan = (s) => `\x1b[36m${s}\x1b[0m`;
    chalk.gray = (s) => `\x1b[90m${s}\x1b[0m`;
    chalk.bold = (s) => `\x1b[1m${s}\x1b[0m`;
  }

  let lighthouse, launchChrome;
  try {
    lighthouse = require('lighthouse');
    const ChromeLauncher = require('chrome-launcher');
    launchChrome = ChromeLauncher.launch;
  } catch (err) {
    console.error(chalk.red('\n❌ ERROR: Required packages are missing.'));
    console.log(chalk.gray('Please install them in your repository local workspace:'));
    console.log(chalk.cyan('  npm install lighthouse chrome-launcher chalk\n'));
    process.exit(1);
  }

  // Target URL from CLI arguments, fallback to local dev
  const targetUrl = process.argv[2] || 'http://localhost:3000';
  
  console.log(chalk.bold('\n================================================================'));
  console.log(chalk.cyan('      ECOSMARTHOME PERFORMANCE & CORE WEB VITALS AUDIT          '));
  console.log(chalk.bold('================================================================'));
  console.log(`Target URL:  ${chalk.underline.yellow(targetUrl)}`);
  console.log(`Timestamp:   ${new Date().toISOString()}`);
  console.log(chalk.gray('----------------------------------------------------------------\n'));

  // Define audit configurations
  const runs = [
    {
      name: 'Mobile Viewport (Responsive Snap-Scroll Frame)',
      emulatedFormFactor: 'mobile',
      throttlingMethod: 'simulate',
    },
    {
      name: 'Desktop Viewport (Split-Screen Grid Layout)',
      emulatedFormFactor: 'desktop',
      throttlingMethod: 'simulate',
    }
  ];

  const resultsSummary = [];

  for (const config of runs) {
    console.log(chalk.cyan(`🚀 Starting Audit for: ${chalk.bold(config.name)}...`));
    
    // Launch headless chrome instance
    const chrome = await launchChrome({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    const options = {
      logLevel: 'error',
      output: 'html',
      onlyCategories: ['performance'],
      port: chrome.port,
      emulatedFormFactor: config.emulatedFormFactor,
      throttlingMethod: config.throttlingMethod,
    };

    try {
      // Execute the Lighthouse run
      const runnerResult = await lighthouse(targetUrl, options);
      
      // Close Chrome browser process
      await chrome.kill();

      const lhr = runnerResult.lhr;
      const htmlReport = runnerResult.report;

      // Ensure directory exists for report outputs
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }

      const fileSlug = `lighthouse-${config.emulatedFormFactor}`;
      fs.writeFileSync(path.join(reportsDir, `${fileSlug}.html`), htmlReport);
      fs.writeFileSync(path.join(reportsDir, `${fileSlug}.json`), JSON.stringify(lhr, null, 2));

      // Extract high-priority audits and metrics
      const perfScore = lhr.categories.performance.score * 100;
      const fcp = lhr.audits['first-contentful-paint'].numericValue; // ms
      const lcp = lhr.audits['largest-contentful-paint'].numericValue; // ms
      const tbt = lhr.audits['total-blocking-time'].numericValue; // ms
      const cls = lhr.audits['cumulative-layout-shift'].numericValue; // rating
      const ttfb = lhr.audits['server-response-time'].numericValue; // ms (TTFB)
      const speedIndex = lhr.audits['speed-index'].numericValue; // ms

      resultsSummary.push({
        formFactor: config.emulatedFormFactor,
        name: config.name,
        score: perfScore,
        fcp,
        lcp,
        tbt,
        cls,
        ttfb,
        speedIndex,
        reportPath: path.join('reports', `${fileSlug}.html`)
      });

      // Display Individual Scorecard
      console.log(chalk.green(`✔ Completed Audit for ${config.emulatedFormFactor}!`));
      console.log(chalk.gray(`  HTML report saved to: ${path.join('reports', `${fileSlug}.html`)}\n`));

    } catch (auditError) {
      console.error(chalk.red(`❌ Audit run failed for ${config.name}:`), auditError);
      await chrome.kill();
    }
  }

  // Print Consolidated Core Web Vitals Summary Table
  console.log(chalk.bold('================================================================'));
  console.log(chalk.cyan('                   PERFORMANCE SCORECARD                        '));
  console.log(chalk.bold('================================================================'));

  resultsSummary.forEach(res => {
    const scoreColor = res.score >= 90 ? chalk.green : (res.score >= 50 ? chalk.yellow : chalk.red);
    const lcpColor = res.lcp <= 1200 ? chalk.green : (res.lcp <= 2500 ? chalk.yellow : chalk.red);
    const tbtColor = res.tbt <= 150 ? chalk.green : (res.tbt <= 300 ? chalk.yellow : chalk.red);
    const clsColor = res.cls <= 0.1 ? chalk.green : (res.cls <= 0.25 ? chalk.yellow : chalk.red);

    console.log(`\n👉 ${chalk.bold(res.name)}`);
    console.log(`   Lighthouse Performance Score: [ ${scoreColor(res.score.toFixed(0) + '/100')} ]`);
    console.log('   ------------------------------------------------------');
    console.log(`   ⏱  Largest Contentful Paint (LCP):  ${lcpColor((res.lcp / 1000).toFixed(2) + 's')}   (Target: < 1.2s for Elite UX)`);
    console.log(`   ⏱  Total Blocking Time (TBT):        ${tbtColor(res.tbt.toFixed(0) + 'ms')}    (Target: < 150ms to defeat slop)`);
    console.log(`   📊 Cumulative Layout Shift (CLS):     ${clsColor(res.cls.toFixed(3))}      (Target: < 0.10 viewport shifts)`);
    console.log(`   ⚡ First Contentful Paint (FCP):      ${chalk.gray((res.fcp / 1000).toFixed(2) + 's')}`);
    console.log(`   📡 Time to First Byte (TTFB):         ${chalk.gray(res.ttfb.toFixed(0) + 'ms')}`);
    console.log(`   📈 Speed Index:                       ${chalk.gray((res.speedIndex / 1000).toFixed(2) + 's')}`);
  });

  console.log(chalk.bold('\n================================================================'));
  console.log(chalk.cyan('                   RELEASE RECOMMANDATIONS                      '));
  console.log(chalk.bold('================================================================'));

  const desktop = resultsSummary.find(r => r.formFactor === 'desktop');
  if (desktop) {
    if (desktop.lcp > 1200) {
      console.log(chalk.yellow('⚠️ LCP Alert: Desktop LCP is currently above our 1.2s threshold.'));
      console.log(chalk.gray('  - Verify that the Roadmap Mockup image uses `fetchpriority="high"` and `loading="eager"`.'));
      console.log(chalk.gray('  - Convert the mockup image format to .avif or .webp and compress it below 150KB.\n'));
    } else {
      console.log(chalk.green('✔ Desktop LCP is in the Elite Zone (<1.2s)! Outstanding image asset delivery.'));
    }

    if (desktop.tbt > 150) {
      console.log(chalk.yellow('⚠️ Total Blocking Time Notice: Long tasks are stalling the main thread.'));
      console.log(chalk.gray('  - Double-check that Gemini Vision Scanner & Aoife Voice AI modules are dynamic/lazy-loaded.'));
      console.log(chalk.gray('  - Move heavy SVG calculations or secondary script scripts off initial mount.\n'));
    } else {
      console.log(chalk.green('✔ Total Blocking Time is under 150ms! Browser interaction is smooth.'));
    }

    if (desktop.cls > 0.10) {
      console.log(chalk.red('❌ Layout Shift Warning: Visual structural elements are jumping during paint.'));
      console.log(chalk.gray('  - Check your CSS layout snapping constraints inside `globals.css`.'));
      console.log(chalk.gray('  - Ensure all layout containers have explicit dimensions or pre-allocated aspect ratios.\n'));
    } else {
      console.log(chalk.green('✔ Layout layout is visually stable (CLS < 0.10). No visual stuttering!'));
    }
  }

  // Generate markdown report for automated CI/CD pipeline artifact comments
  const markdownReport = `
### ⚡ EcoSmartHome Core Web Vitals Report

| Emulated Profile | Performance Score | Largest Contentful Paint (LCP) | Total Blocking Time (TBT) | Cumulative Layout Shift (CLS) |
| :--- | :---: | :---: | :---: | :---: |
${resultsSummary.map(r => `| **${r.formFactor === 'desktop' ? '💻 Desktop Grid' : '📱 Mobile Snap'}** | ${r.score.toFixed(0)}/100 | ${(r.lcp / 1000).toFixed(2)}s | ${r.tbt.toFixed(0)}ms | ${r.cls.toFixed(3)} |`).join('\n')}

_Audit executed automatically against **${targetUrl}** on **${new Date().toLocaleDateString('en-IE')}** at **${new Date().toLocaleTimeString('en-IE')}**._
`;

  fs.writeFileSync(path.join(process.cwd(), 'reports', 'lighthouse-summary.md'), markdownReport.trim());
  console.log(chalk.cyan(`\n📝 Generated GitHub Actions markdown comment file inside: ${chalk.bold('reports/lighthouse-summary.md')}\n`));
}

runAudit().catch(err => {
  console.error('\n❌ CRITICAL PERFORMANCE AUDIT ERROR:', err);
  process.exit(1);
});
