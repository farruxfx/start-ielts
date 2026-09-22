// ============================================================
// Asosiy user flow (Phase 8.6):
// signup → onboarding (6 qadam) → dashboard → practice → reading
// ============================================================

describe('Main flow: signup → dashboard → practice', () => {
  it('completes the full journey for a new user', () => {
    cy.stubSupabaseAuth('Journey Student');

    // ── 1. Sign up ──────────────────────────────────────
    cy.visit('/signup');
    const email = `journey+${Date.now()}@example.com`;
    cy.get('#name').type('Journey Student');
    cy.get('#email').type(email);
    cy.get('#password').type('supersecret1');
    cy.get('form').contains('button', 'Create free account').click();
    cy.wait('@supabaseSignup');
    cy.url().should('include', '/onboarding');

    // ── 2. Onboarding: 6 qadam ──────────────────────────
    // Step 1 — Target Band
    cy.contains('Target Band').should('be.visible');
    cy.contains('button', '7.0').click();
    cy.contains('button', 'Next').click();

    // Step 2 — Focus Skills
    cy.contains('Focus Skills').should('be.visible');
    cy.contains('button', 'Reading').click();
    cy.contains('button', 'Next').click();

    // Step 3 — Exam Date (ixtiyoriy)
    cy.contains('Exam Date').should('be.visible');
    cy.contains('button', 'Skip').click();

    // Step 4 — Current Level
    cy.contains('Current Level').should('be.visible');
    cy.contains('button', 'Good everyday English').click();
    cy.contains('button', 'Next').click();

    // Step 5 — Study Time
    cy.contains('Study Time').should('be.visible');
    cy.contains('button', 'Focused study session').click();
    cy.contains('button', 'Next').click();

    // Step 6 — Exam Type → finish
    cy.contains('Exam Type').should('be.visible');
    cy.contains('button', 'For university admission').click();
    cy.contains('button', 'Start Learning').click();

    // ── 3. Dashboard ────────────────────────────────────
    cy.url().should('include', '/dashboard');
    cy.contains(/Good (morning|afternoon|evening), Journey Student/).should('be.visible');
    cy.contains('Quick Practice').should('be.visible');

    // Onboarding ma'lumotlari saqlanganmi?
    cy.window().then(win => {
      const onboarding = JSON.parse(
        win.localStorage.getItem('ieltspro_onboarding') || '{}'
      );
      expect(onboarding.targetBand).to.eq('7.0');
      expect(onboarding.examType).to.eq('academic');
    });

    // ── 4. Practice ─────────────────────────────────────
    cy.contains('a', 'Start practicing').click();
    cy.url().should('include', '/practice');
    cy.contains('Test Library').should('be.visible');

    // ── 5. Reading test ochish ──────────────────────────
    cy.get('a[href^="/reading/"]').first().click();
    cy.url().should('include', '/reading/');
    cy.contains('Reading Tests').should('exist');
  });
});
