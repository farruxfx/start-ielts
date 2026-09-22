// ============================================================
// Auth flow E2E — signup / signin (Phase 8.6)
// ============================================================

describe('Authentication', () => {
  beforeEach(() => {
    cy.stubSupabaseAuth();
  });

  describe('Sign Up validation', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });

    it('shows Zod errors for a too-short name', () => {
      cy.get('#name').type('A');
      cy.get('#email').type('newuser@example.com');
      cy.get('#password').type('supersecret');
      cy.get('form').contains('button', 'Create free account').click();
      cy.contains(/Ism kamida 2 ta belgidan/).should('be.visible');
      cy.url().should('include', '/signup');
    });

    it('shows Zod errors for a too-short password', () => {
      cy.get('#name').type('Aziz Karimov');
      cy.get('#email').type('newuser@example.com');
      cy.get('#password').type('123');
      cy.get('form').contains('button', 'Create free account').click();
      cy.contains(/Parol kamida 6 ta belgidan/).should('be.visible');
      cy.url().should('include', '/signup');
    });
  });

  describe('Sign Up flow', () => {
    it('registers a new user and lands on onboarding', () => {
      cy.visit('/signup');
      cy.get('#name').type('E2E Student');
      cy.get('#email').type(`e2e+${Date.now()}@example.com`);
      cy.get('#password').type('supersecret1');
      cy.get('form').contains('button', 'Create free account').click();

      cy.wait('@supabaseSignup');
      cy.url().should('include', '/onboarding');
      cy.contains('Target Band').should('be.visible');
    });
  });

  describe('Sign In flow', () => {
    it('signs in and lands on the dashboard', () => {
      cy.visit('/signin');
      cy.get('#email').type('e2e.student@example.com');
      cy.get('#password').type('supersecret1');
      cy.get('form').contains('button', 'Sign in').click();

      cy.wait('@supabaseToken');
      cy.url().should('include', '/dashboard');
      cy.contains(/Good (morning|afternoon|evening)/).should('be.visible');
    });

    it('shows a validation error for a short password', () => {
      cy.visit('/signin');
      cy.get('#email').type('e2e.student@example.com');
      cy.get('#password').type('123');
      cy.get('form').contains('button', 'Sign in').click();
      cy.contains(/Parol kamida 6 ta belgidan/).should('be.visible');
      cy.url().should('include', '/signin');
    });
  });
});
