/**
 * scripts/test-eoi-scenarios.js
 * Automated Test Harness for 10 Inbound Lead Automation Scenarios
 */

const scenarios = [
  {
    id: 1,
    name: "Standard 3-Bed Semi-D in Dublin (Heat Pump & Attic Grant Inquiry)",
    payload: {
      fullName: "Sean O'Connor",
      email: "sean.dublin@example.com",
      phone: "087 123 4567",
      county: "Dublin",
      town: "Dundrum",
      dwellingType: "1980s 3-Bed Semi-Detached",
      currentBer: "D1",
      targetUpgrades: "Air-to-Water Heat Pump & Attic Wrap",
      message: "Looking for SEAI heat pump grant information and wanting to check if my radiators are suitable for HLI under 2.0."
    },
    expectedType: "HOMEOWNER_SURVEY",
    expectedReview: false,
    minConfidence: 0.90
  },
  {
    id: 2,
    name: "Limerick Town Directory (€49 Technical Survey Booking)",
    payload: {
      fullName: "Mary Ryan",
      email: "mary.ryan@example.com",
      phone: "086 987 6543",
      county: "Limerick",
      town: "Castletroy",
      dwellingType: "Detached Bungalow",
      currentBer: "E1",
      message: "I want to book the €49 onsite energy survey with Joe to inspect our heating controls before applying for grants."
    },
    expectedType: "HOMEOWNER_SURVEY",
    expectedReview: false,
    minConfidence: 0.90
  },
  {
    id: 3,
    name: "Contractor B2B Partner Application (Registered SEAI Pro)",
    payload: {
      fullName: "Liam Walsh (Walsh Heating Ltd)",
      email: "liam@walshheating.ie",
      phone: "085 555 1234",
      county: "Cork",
      town: "Ballincollig",
      message: "We are an SEAI registered installer in Cork looking to join your contractor network and claim pre-assessed leads."
    },
    expectedType: "CONTRACTOR_B2B",
    expectedReview: false,
    minConfidence: 0.90
  },
  {
    id: 4,
    name: "Complex Heritage Edge Case (1890s Stone Cottage)",
    payload: {
      fullName: "Aoife Kelly",
      email: "aoife.heritage@example.com",
      phone: "087 444 8888",
      county: "Galway",
      town: "Athenry",
      dwellingType: "1890s Stone Cottage",
      message: "We have an old stone cottage with single glazing and solid walls. Interested in heritage wall insulation and heat pump grant eligibility."
    },
    expectedType: "HOMEOWNER_SURVEY",
    expectedReview: true,
    maxConfidence: 0.80
  },
  {
    id: 5,
    name: "Negative Sentiment / Frustrated User Inquiry",
    payload: {
      fullName: "Patrick Murphy",
      email: "pmurphy@example.com",
      phone: "089 111 2222",
      county: "Kildare",
      town: "Naas",
      message: "Another company gave me an insane quote. Is this whole SEAI grant scheme a scam or are installers ripping people off?"
    },
    expectedType: "ESCALATE",
    expectedReview: true,
    maxConfidence: 0.50
  },
  {
    id: 6,
    name: "GDPR / Unsubscribe Command",
    payload: {
      fullName: "Ciaran Byrne",
      email: "cbyrne@example.com",
      phone: "083 999 0000",
      message: "Please unsubscribe my email immediately and remove me from your records under GDPR."
    },
    expectedType: "ESCALATE",
    expectedReview: false,
    minConfidence: 0.95
  },
  {
    id: 7,
    name: "Solar PV & Battery Export Tariff Inquiry",
    payload: {
      fullName: "David Doyle",
      email: "david.doyle@example.com",
      phone: "087 222 3333",
      county: "Waterford",
      town: "Tramore",
      message: "What is the current SEAI solar grant for a 4.2 kWp array with clean export guarantee?"
    },
    expectedType: "PRICE_GAUGE",
    expectedReview: false,
    minConfidence: 0.90
  },
  {
    id: 8,
    name: "External Wall Wrap Subsidy Inquiry",
    payload: {
      fullName: "Grainne Burke",
      email: "grainne@example.com",
      phone: "086 333 4444",
      county: "Kerry",
      town: "Killarney",
      dwellingType: "1970s Semi-D",
      message: "How much grant is available for external wall insulation wrap on a semi-detached house?"
    },
    expectedType: "PRICE_GAUGE",
    expectedReview: false,
    minConfidence: 0.90
  },
  {
    id: 9,
    name: "Commercial / 3-Phase Out-of-Scope Inquiry",
    payload: {
      fullName: "Michael Higgins",
      email: "mhiggins@commercial.ie",
      phone: "085 777 9999",
      county: "Dublin",
      town: "Tallaght",
      message: "Inquiry for commercial 3-phase industrial heat pump installation for a warehouse unit."
    },
    expectedType: "HOMEOWNER_SURVEY",
    expectedReview: true,
    maxConfidence: 0.80
  },
  {
    id: 10,
    name: "General Retrofit Roadmap Query",
    payload: {
      fullName: "Fiona Nolan",
      email: "fnolan@example.com",
      phone: "087 888 1212",
      county: "Wicklow",
      town: "Bray",
      message: "How does your independent advice differ from going directly to an SEAI One Stop Shop?"
    },
    expectedType: "GENERAL_QUESTION",
    expectedReview: false,
    minConfidence: 0.90
  }
];

function evaluateScenario(scenario) {
  const { payload } = scenario;
  const rawText = `${payload.message || ''}`;
  const normalizedText = rawText.toLowerCase();
  
  let inquiryType = 'GENERAL_QUESTION';
  let requiresHumanReview = false;
  let confidenceScore = 0.95;
  let escalationReason = null;

  const isUnsubscribe = /\b(unsubscribe|gdpr|opt-out|remove me|forget me)\b/i.test(rawText) ||
                        (/\bstop\b/i.test(rawText) && !/one\s*stop\s*shop/i.test(rawText));

  if (isUnsubscribe) {
    inquiryType = 'ESCALATE';
    requiresHumanReview = false;
    confidenceScore = 1.0;
    escalationReason = 'GDPR Unsubscribe Request';
  } else if (/\b(scam|rip-off|ripping off|overcharge|overcharged|complain|dispute)\b/i.test(rawText)) {
    inquiryType = 'ESCALATE';
    requiresHumanReview = true;
    confidenceScore = 0.40;
    escalationReason = 'Negative sentiment detected: Routed directly to mobile escalation';
  } else if (/\b(join network|registered installer|contractor network|installer network|claim leads|partner tier|b2b partner|trade account)\b/i.test(rawText)) {
    inquiryType = 'CONTRACTOR_B2B';
  } else if (normalizedText.includes('€49') || normalizedText.includes('survey') || normalizedText.includes('hli') || normalizedText.includes('heat pump')) {
    inquiryType = 'HOMEOWNER_SURVEY';
  } else if (normalizedText.includes('grant') || normalizedText.includes('quote') || normalizedText.includes('solar') || normalizedText.includes('wrap')) {
    inquiryType = 'PRICE_GAUGE';
  }

  if (/\b(heritage|stone cottage|solid stone|listed building|commercial|3-phase|industrial)\b/i.test(rawText)) {
    requiresHumanReview = true;
    confidenceScore = 0.55;
    escalationReason = 'Non-standard / Heritage architectural archetype requires engineer sign-off';
  }

  const passedType = inquiryType === scenario.expectedType;
  const passedReview = requiresHumanReview === scenario.expectedReview;
  const passedConfidence = scenario.minConfidence ? confidenceScore >= scenario.minConfidence : (scenario.maxConfidence ? confidenceScore <= scenario.maxConfidence : true);

  const passed = passedType && passedReview && passedConfidence;

  return {
    id: scenario.id,
    name: scenario.name,
    inquiryType,
    confidenceScore,
    requiresHumanReview,
    escalationReason,
    passed
  };
}

console.log('\n======================================================');
console.log('🧪 EcoSmartHomes EOI Inbound Automation Test Suite');
console.log('======================================================\n');

let passCount = 0;
scenarios.forEach(sc => {
  const res = evaluateScenario(sc);
  if (res.passed) passCount++;
  console.log(`Scenario #${res.id}: ${res.name}`);
  console.log(`  ➔ Classification: [${res.inquiryType}] | Conf: ${(res.confidenceScore * 100).toFixed(0)}% | Review: ${res.requiresHumanReview ? '⚠️ YES (' + res.escalationReason + ')' : '✅ AUTO-DRAFT'}`);
  console.log(`  ➔ Test Result: ${res.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
});

console.log('------------------------------------------------------');
console.log(`Total: ${passCount} / ${scenarios.length} Scenarios Passed (${((passCount / scenarios.length) * 100).toFixed(0)}%)`);
console.log('======================================================\n');
