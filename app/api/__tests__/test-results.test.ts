/**
 * API route tests — POST/GET /api/test-results (Phase 8.4)
 *
 * @jest-environment node
 */

// ── Mocks ──────────────────────────────────────────────────

let mockSession: { user: { id: string; email?: string } } | null = null;
let mockDbResult: { data: unknown; error: { message: string } | null } = {
  data: [],
  error: null,
};

function makeChain(result: { data: unknown; error: { message: string } | null }) {
  const obj: Record<string, unknown> = {};
  ['select', 'eq', 'order', 'limit', 'insert', 'upsert', 'single', 'maybeSingle'].forEach(
    m => {
      obj[m] = jest.fn(() => obj);
    }
  );
  obj.then = (
    onFulfilled: (v: typeof result) => unknown,
    onRejected: (e: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return obj;
}

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: jest.fn(() => makeChain(mockDbResult)),
  },
}));

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: mockSession } }),
    },
  }),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

import { GET, POST } from '../test-results/route';

// ── Helpers ────────────────────────────────────────────────

function makeRequest(body?: unknown, url = 'http://localhost/api/test-results') {
  return new Request(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const validResult = {
  test_id: 'test-1',
  test_title: 'Reading Test 1',
  skill: 'reading',
  overall_band: 7.5,
  correct_answers: 35,
  total_questions: 40,
  accuracy: 88,
  time_spent_minutes: 60,
};

beforeEach(() => {
  mockSession = { user: { id: 'user-1', email: 'u@example.com' } };
  mockDbResult = { data: [], error: null };
});

// ── GET /api/test-results ──────────────────────────────────

describe('GET /api/test-results', () => {
  test('returns 401 when unauthenticated', async () => {
    mockSession = null;
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  test('returns results for authenticated user', async () => {
    mockDbResult = { data: [{ id: 'r1', skill: 'reading' }], error: null };
    const res = await GET(makeRequest(undefined, 'http://localhost/api/test-results?skill=reading'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].skill).toBe('reading');
  });

  test('returns 500 on database error', async () => {
    mockDbResult = { data: null, error: { message: 'db exploded' } };
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('db exploded');
  });
});

// ── POST /api/test-results ─────────────────────────────────

describe('POST /api/test-results', () => {
  test('rejects missing required fields', async () => {
    const res = await POST(makeRequest({ test_id: 'x' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Missing required field');
  });

  test('rejects invalid skill value', async () => {
    const res = await POST(makeRequest({ ...validResult, skill: 'dancing' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid skill value');
  });

  test('rejects band score outside 0–9', async () => {
    const res = await POST(makeRequest({ ...validResult, overall_band: 12 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid band score');
  });

  test('rejects unauthenticated insert', async () => {
    mockSession = null;
    const res = await POST(makeRequest(validResult));
    expect(res.status).toBe(401);
  });

  test('creates a result with valid payload', async () => {
    mockDbResult = { data: { id: 'new-1', ...validResult }, error: null };
    const res = await POST(makeRequest(validResult));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('new-1');
  });

  test('returns 500 when insert fails', async () => {
    mockDbResult = { data: null, error: { message: 'insert failed' } };
    const res = await POST(makeRequest(validResult));
    expect(res.status).toBe(500);
  });
});
