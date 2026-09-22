// ============================================================
// Dashboard E2E — widgets, navigation, sign out (Phase 8.6)
// ============================================================

describe('Dashboard', () => {
  it('renders the greeting, quick actions and skill cards', () => {
    cy.seedSession({ name: 'E2E Student' }, '/dashboard');

    // Greeting
    cy.contains(/Good (morning|afternoon|evening), E2E Student/).should('be.visible');

    // Quick practice shortcuts
    cy.contains('Quick Practice').should('be.visible');
    cy.get('a[href="/listening"]').should('exist');
    cy.get('a[href="/reading"]').should('exist');
    cy.get('a[href="/writing"]').should('exist');
    cy.get('a[href="/speaking"]').should('exist');

    // Skill progress cards
    cy.contains('Your Skills').should('be.visible');
    cy.contains('Not started').should('exist');

    // Stats row
    cy.contains('Target').should('be.visible');
    cy.contains('Current').should('be.visible');
    cy.contains('Streak').should('be.visible');
    cy.contains('Tests').should('be.visible');
  });

  it('shows the empty state for a brand-new user', () => {
    cy.seedSession({ name: 'Fresh Student' }, '/dashboard');
    cy.contains('Welcome to IELTS PRO!').should('be.visible');
    cy.contains('Take your first test').should('be.visible');
  });

  it('navigates to Practice via the greeting CTA', () => {
    cy.seedSession({ name: 'E2E Student' }, '/dashboard');
    cy.contains('a', 'Start practicing').click();
    cy.url().should('include', '/practice');
    cy.contains('Test Library').should('be.visible');
  });

  it('navigates to Practice via the sidebar link', () => {
    cy.seedSession({ name: 'E2E Student' }, '/dashboard');
    cy.get('aside nav').contains('a', 'Practice').click();
    cy.url().should('include', '/practice');
    cy.contains('Test Library').should('be.visible');
  });

  it('signs out and returns to the landing page', () => {
    cy.seedSession({ name: 'E2E Student' }, '/dashboard');
    cy.get('aside').contains('button', 'Sign out').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    // Session cleaned up
    cy.window().then(win => {
      expect(win.localStorage.getItem('ieltspro_current_user')).to.eq(null);
    });
  });
});
