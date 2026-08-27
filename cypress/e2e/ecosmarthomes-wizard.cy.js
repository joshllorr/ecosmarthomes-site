describe('EcoSmartHome Onboarding Wizard - E2E Integration Test Suite', () => {
  beforeEach(() => {
    // Visit the Hub landing page hosting the Onboarding Wizard component
    cy.visit('/');
    
    // Ensure the main CTA is present and click to open the modal wizard
    cy.get('button').contains('Activate My Shield', { timeout: 10000 }).should('be.visible').click();
  });

  it('should guide the user flawlessly through the 5-step conversion funnel', () => {
    // ---------------------------------------------------------
    // STEP 1: PROPERTY PROFILING
    // ---------------------------------------------------------
    cy.log('Executing Step 1: Property Profiling & BER Base Check');
    cy.get('[data-testid="wizard-step-1"]').should('be.visible');

    // Select Property Archetype: "Detached"
    cy.get('button[data-archetype="detached"]').should('be.visible').click();
    cy.get('button[data-archetype="detached"]').should('have.class', 'border-brand-emerald');

    // Select starting BER Rating: "E1"
    cy.get('select[name="berRating"]').should('be.visible').select('E1');
    cy.get('select[name="berRating"]').should('have.value', 'E1');

    // Click "Next" to transition to Step 2
    cy.get('button').contains('Continue').should('be.visible').click();

    // ---------------------------------------------------------
    // STEP 2: FUEL & CARBON TAX SLIDER
    // ---------------------------------------------------------
    cy.log('Executing Step 2: Fuel Selection & Annual Bill Sizing');
    cy.get('[data-testid="wizard-step-2"]').should('be.visible');

    // Select Kerosene/Oil Fuel Type to test Carbon Tax risk
    cy.get('button[data-fuel="oil"]').should('be.visible').click();
    cy.get('button[data-fuel="oil"]').should('have.class', 'border-brand-emerald');

    // Adjust annual bill range slider to €4,000 using native trigger
    cy.get('input[type="range"][name="annualBill"]')
      .should('be.visible')
      .invoke('val', 4000)
      .trigger('change')
      .trigger('input');

    // Assert that the Carbon Tax Risk indicator displays recalculated exposure
    cy.get('[data-testid="tax-exposure-value"]').should('contain', '€');

    // Proceed to Step 3
    cy.get('button').contains('Continue').click();

    // ---------------------------------------------------------
    // STEP 3: GEMINI 2.5 FLASH VISION SCANNER
    // ---------------------------------------------------------
    cy.log('Executing Step 3: Multimodal Diagnostic Photo Upload Sim');
    cy.get('[data-testid="wizard-step-3"]').should('be.visible');
    cy.get('h3').contains('Gemini 2.5 Flash Vision').should('be.visible');

    // Attach mock boiler image representing native device upload
    const fixtureFile = 'boiler-leak-sample.jpg';
    cy.get('input[type="file"][accept="image/*"]').selectFile({
      contents: Cypress.Buffer.from('mock image data'),
      fileName: fixtureFile,
      mimeType: 'image/jpeg',
    }, { force: true });

    // Assert that the hardware-accelerated scanning laser is executing
    cy.get('.scanner-laser').should('be.visible');
    cy.get('[data-testid="scanning-status-label"]').should('contain', 'Analyzing equipment');

    // Wait for the simulated Gemini analysis to complete gracefully
    cy.get('[data-testid="analysis-result-badge"]', { timeout: 8000 })
      .should('be.visible')
      .should('contain', 'SR50 Readiness Alert');

    // Proceed to Step 4
    cy.get('button').contains('View My Payback Map').click();

    // ---------------------------------------------------------
    // STEP 4: SEAI GRANT & EQUITY PAYBACK
    // ---------------------------------------------------------
    cy.log('Executing Step 4: Financial Validation & Projections');
    cy.get('[data-testid="wizard-step-4"]').should('be.visible');

    // Assert dynamic SEAI grants update based on Step 1 input (E1 rating)
    cy.get('[data-testid="grant-incentive-output"]')
      .invoke('text')
      .then((grantText) => {
        const grantAmount = parseInt(grantText.replace(/[^0-9]/g, ''), 10);
        expect(grantAmount).to.be.at.most(25500);
        expect(grantAmount).to.be.at.least(8000);
      });

    // Assert operational fuel bill slashed projection output
    cy.get('[data-testid="target-bill-output"]').should('contain', '€650');

    // Verify +16% Property Equity Appreciation banner renders
    cy.get('[data-testid="equity-appreciation-badge"]')
      .should('be.visible')
      .should('contain', '16%');

    // Proceed to final Step 5 Checkout
    cy.get('button').contains('Generate My Roadmap').click();

    // ---------------------------------------------------------
    // STEP 5: HARDENED STRIPE CONVERSION CHECKOUT
    // ---------------------------------------------------------
    cy.log('Executing Step 5: Stripe Integration & Security Verification');
    cy.get('[data-testid="wizard-step-5"]').should('be.visible');

    // Assert the core deliverables checklist items are present
    const expectedDeliverables = [
      '100% Conflict-Free Guarantee',
      'No Installer Kickbacks',
      'Completed by Joe',
      'Delivered to WhatsApp'
    ];
    expectedDeliverables.forEach((item) => {
      cy.get('[data-testid="deliverables-checklist"]').should('contain', item);
    });

    // CRITICAL SECURITY AUDIT: Verify that the purchase button does NOT leak stripe test variables
    cy.get('[data-testid="stripe-checkout-cta"]')
      .should('have.attr', 'href')
      .and('not.include', 'test_')
      .and('include', 'buy.stripe.com/aFabJ01EGbPz6tn8UYeME00');
  });

  it('should gracefully handle viewport modal exit controls', () => {
    cy.get('[data-testid="close-wizard-button"]').should('be.visible').click();
    cy.get('[data-testid="wizard-modal-overlay"]').should('not.exist');
  });
});
