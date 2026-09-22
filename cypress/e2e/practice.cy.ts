// ============================================================
// Practice E2E — test library, filters, search (Phase 8.6)
// ============================================================

describe('Practice library', () => {
  beforeEach(() => {
    cy.seedSession({ name: 'E2E Student' }, '/practice');
  });

  it('renders the skill cards and test library', () => {
    cy.contains('Test Library').should('be.visible');
    cy.contains(/tests available/).should('be.visible');

    // 4 ta skill kartasi
    cy.get('a[href="/listening"]').should('exist');
    cy.get('a[href="/reading"]').should('exist');
    cy.get('a[href="/writing"]').should('exist');

    // Test cards render
    cy.get('a[href^="/reading/"]').should('exist');
    cy.get('a[href^="/listening/"]').should('exist');
  });

  it('filters tests with skill tabs', () => {
    cy.contains('p', 'tests available')
      .invoke('text')
      .then(text => {
        const allCount = parseInt(text, 10);
        expect(allCount).to.be.greaterThan(0);

        cy.contains('button', 'Listening').click();
        cy.contains('p', 'tests available')
          .invoke('text')
          .then(filteredText => {
            const filtered = parseInt(filteredText, 10);
            expect(filtered).to.be.greaterThan(0);
            expect(filtered).to.be.lessThan(allCount);
          });
      });

    // Listening filtrida faqat listening kartalari
    cy.get('a[href^="/listening/"]').should('exist');
    cy.get('a[href^="/reading/"]').should('not.exist');
  });

  it('filters tests with the search box', () => {
    cy.get('input[placeholder="Search tests..."]').type('zzzz-not-a-real-test');
    cy.contains('No tests found.').should('be.visible');

    cy.get('input[placeholder="Search tests..."]').clear();
    cy.get('a[href^="/reading/"]').should('exist');
  });

  it('opens a reading test from the library', () => {
    cy.get('a[href^="/reading/"]').first().click();
    cy.url().should('include', '/reading/');
    // Test sahifasi ochilgani: h1 (test nomi) ko'rinadi
    cy.get('h1').should('be.visible');
  });

  it('opens the Reading skill card section', () => {
    cy.get('a[href="/reading"]').first().click();
    cy.url().should('include', '/reading');
    cy.contains('Reading Tests').should('be.visible');
  });
});
