// ============================================================
// Custom Cypress commands
// ============================================================

export interface E2EUser {
  id?: string;
  email: string;
  name: string;
  role?: 'student' | 'teacher' | 'admin';
}

type SeedUser = Partial<E2EUser>;

declare global {
  namespace Cypress {
    interface Chainable {
      /** localStorage'ga mock sessiya yozib, sahifani ochadi */
      seedSession(user?: SeedUser, path?: string): Chainable<void>;
      /** Supabase signup/token so'rovlarini stub qiladi */
      stubSupabaseAuth(name?: string, email?: string): Chainable<void>;
    }
  }
}

const DEFAULT_USER: E2EUser = {
  id: 'e2e-user-001',
  email: 'e2e.student@example.com',
  name: 'E2E Student',
  role: 'student',
};

/**
 * Mock sessiya yaratib, sahifani ochadi.
 * Supabase ishlamayotgan bo'lsa mock auth provider localStorage'dan o'qiydi.
 */
Cypress.Commands.add(
  'seedSession',
  (user: SeedUser = DEFAULT_USER, path: string = '/dashboard') => {
    const fullUser = { ...DEFAULT_USER, ...user };
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('ieltspro_current_user', JSON.stringify(fullUser));
        win.localStorage.setItem(
          'ieltspro_user_profile',
          JSON.stringify({
            name: fullUser.name,
            email: fullUser.email,
            targetBand: 7.5,
            createdAt: new Date().toISOString(),
          })
        );
        win.localStorage.setItem('ieltspro_test_results', JSON.stringify([]));
      },
    });
  }
);

/**
 * Supabase auth endpointlarini stub qiladi — test haqiqiy backendga
 * urinmaydi, lekin ilova normal signup/signin flow'ni ko'radi.
 */
Cypress.Commands.add(
  'stubSupabaseAuth',
  (name: string = 'E2E Student', email: string = 'e2e.student@example.com') => {
    const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'e2e-user-001',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      exp: now + 3600,
      iat: now,
      session_id: 'e2e-session',
    })
  );
  const accessToken = `${header}.${payload}.e2e-signature`;

  const authBody = {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: 'e2e-refresh-token',
    user: {
      id: 'e2e-user-001',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  // Signup
  cy.intercept('POST', '**/auth/v1/signup', {
    statusCode: 200,
    body: authBody,
  }).as('supabaseSignup');

  // Password grant (signin)
  cy.intercept('POST', '**/auth/v1/token*', {
    statusCode: 200,
    body: authBody,
  }).as('supabaseToken');

  // Logout
  cy.intercept('POST', '**/auth/v1/logout', {
    statusCode: 204,
    body: '',
  }).as('supabaseLogout');

  // Token refresh (page reload'larda chaqirilishi mumkin)
  cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', {
    statusCode: 200,
    body: authBody,
  }).as('supabaseRefresh');
});

export {};
