// ============================================================
// Cypress E2E support — global setup (Phase 8.5)
// ============================================================

import './commands';

// Supabase'ning haqiqiy backend'ga murojaatlarini shu joyda jimlaymiz —
// testlar lokal muhitda izolyatsiya ishlasin.
beforeEach(() => {
  // profiles jadvaliga REST so'rovlari (RLS xabarlari shovqin qilmasin)
  cy.intercept('GET', '**/rest/v1/profiles*', { statusCode: 200, body: [] }).as(
    'profilesSelect'
  );
  cy.intercept('POST', '**/rest/v1/profiles*', { statusCode: 201, body: {} }).as(
    'profilesInsert'
  );
  cy.intercept('PATCH', '**/rest/v1/profiles*', { statusCode: 200, body: {} }).as(
    'profilesUpdate'
  );
  // Supabase auth sessiyasini tekshiruvchi so'rovlar
  cy.intercept('GET', '**/auth/v1/user*', { statusCode: 200, body: { id: 'e2e-user' } }).as(
    'authUser'
  );
  // Logout — signOut ni sekinlatmasin (haqiqiy backendga urinmasin)
  cy.intercept('POST', '**/auth/v1/logout', { statusCode: 204, body: '' }).as('logout');
  // Token refresh — page reload'larda chaqiriladi
  cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', {
    statusCode: 400,
    body: { error: 'invalid_grant', error_description: 'e2e: no refresh' },
  }).as('refreshToken');
});

// Budaydigan xatolarni testni yiqitmasin — lekin logga tashlaymiz
Cypress.on('uncaught:exception', err => {
  // Supabase / analytics шумлари — test flow uchun ahamiyatsiz
  if (
    err.message.includes('ResizeObserver') ||
    err.message.includes('IntersectionObserver') ||
    err.message.includes('fetch') ||
    err.message.includes('supabase')
  ) {
    return false;
  }
  // Boshqa xatolarni testga uzatamiz
  return true;
});
