/**
 * scripts/multi-agent-designer.js
 * Multi-Agent Design & Engineering Review Panel powered by Free LLMAPI Proxy
 * 
 * Personas:
 * 1. Elena (Senior Mobile UI/UX & Interaction Designer)
 * 2. Aoife (Senior Retrofit Engineer - SEAI & NSAI Standards)
 * 3. Eimear (Real Estate Valuation & Green Mortgage Strategist)
 * 4. Declan (Trades Lead & Heat Pump Sizing Engineer)
 * 5. Ciaran (CRO & Conversion Funnel Architect)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

const BASE_URL = process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL || 'http://127.0.0.1:31415/v1';
const API_KEY = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '';
const DEFAULT_MODEL = process.env.LLM_MODEL || 'auto';

const AGENT_PERSONAS = {
  ux: {
    name: 'Elena Vance',
    role: 'Senior Mobile UI/UX & Interaction Designer',
    systemPrompt: `You are Elena Vance, a top-tier mobile UI/UX architect specializing in Apple iOS HIG, fintech micro-interactions, glassmorphism, and haptic design. Focus on tactile feedback, 48px+ touch targets, 84vw card peeking, thumb-zone ergonomics, and 60fps animations. Provide sharp, actionable design critiques.`
  },
  retrofit: {
    name: 'Aoife Gallagher',
    role: 'Senior Retrofit Engineer (SEAI & NSAI Specialist)',
    systemPrompt: `You are Aoife Gallagher, an independent Irish energy consultant. Ground all feedback in SEAI May 2026 grant guidelines, NSAI SR50, DEAP 4.2.2 calculations, and Irish Carbon Tax escalators. Ensure absolute accuracy for Irish homeowners.`
  },
  valuation: {
    name: 'Eimear O\'Brien',
    role: 'Real Estate Valuation & Green Mortgage Strategist',
    systemPrompt: `You are Eimear O'Brien, a high-performing Irish estate agent and mortgage arbitrage consultant. Focus on Daft.ie listing appeal, A/B rating capital equity surge (+€38,000 average), 3.45% BPFI Green Mortgage savings, and closing speed.`
  },
  installer: {
    name: 'Declan Murphy',
    role: 'Trades Lead & Heat Pump Sizing Engineer',
    systemPrompt: `You are Declan Murphy, an experienced Irish heating engineer and trades contractor. Focus on Delta-T30 radiator sizing, 45°C flow temperatures, HLI <= 2.0 W/K/m² threshold, 28mm primary piping, and avoiding unnecessary contractor markups.`
  },
  cro: {
    name: 'Ciaran Walsh',
    role: 'CRO & Conversion Funnel Architect',
    systemPrompt: `You are Ciaran Walsh, a growth and conversion rate optimization specialist for web applications. Focus on micro-copy, headline clarity, friction reduction, dopamine tickers, social proof, and seamless freemium onboarding.`
  }
};

async function queryAgent(agentKey, promptText, model = DEFAULT_MODEL) {
  const agent = AGENT_PERSONAS[agentKey];
  if (!agent) throw new Error(`Unknown agent: ${agentKey}`);

  const parsedUrl = new URL(BASE_URL + '/chat/completions');
  const postData = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: agent.systemPrompt },
      { role: 'user', content: promptText }
    ],
    temperature: 0.3,
    max_tokens: 450
  });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${API_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`Agent [${agent.name}] Error: ${json.error.message || JSON.stringify(json.error)}`));
          } else {
            const answer = json.choices?.[0]?.message?.content || 'No response generated.';
            resolve({ agent: agent.name, role: agent.role, response: answer });
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function runPanel(promptTopic) {
  console.log(`\n======================================================`);
  console.log(`🤖 EcoSmartHomes Multi-Agent Design Review Panel`);
  console.log(`🎯 Review Topic: "${promptTopic}"`);
  console.log(`📡 Connected Proxy: ${BASE_URL} (Model: ${DEFAULT_MODEL})`);
  console.log(`======================================================\n`);

  const keys = Object.keys(AGENT_PERSONAS);
  console.log(`Invoking ${keys.length} agents in parallel...\n`);

  const promises = keys.map(key => 
    queryAgent(key, promptTopic)
      .catch(err => ({ agent: AGENT_PERSONAS[key].name, role: AGENT_PERSONAS[key].role, response: `⚠️ Error: ${err.message}` }))
  );

  const results = await Promise.all(promises);

  results.forEach(res => {
    console.log(`------------------------------------------------------`);
    console.log(`👤 ${res.agent} [${res.role}]`);
    console.log(`------------------------------------------------------`);
    console.log(`${res.response.trim()}\n`);
  });

  console.log(`======================================================`);
  console.log(`✅ Multi-Agent Review Complete.`);
  console.log(`======================================================\n`);
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const topicArg = args.find(a => !a.startsWith('--')) || 'Review the new mobile UX with glassmorphic bottom dock, 84vw bank card peeking, and radial floating action launcher (+ button rotating to X). How can we make it even more engaging for Irish users?';
  runPanel(topicArg);
}

module.exports = { queryAgent, runPanel, AGENT_PERSONAS };
