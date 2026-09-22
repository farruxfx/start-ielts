import {
  apiSuccess,
  apiError,
  validateRequired,
  validateEmail,
  validateBandScore,
  checkRateLimit,
  sanitizeString,
  sanitizeObject,
  getPaginationParams,
  handleApiError,
} from '../api-utils';

describe('API Utilities', () => {
  describe('response helpers', () => {
    test('apiSuccess builds a success payload', () => {
      expect(apiSuccess({ id: 1 }, 201)).toEqual({
        success: true,
        data: { id: 1 },
        status: 201,
      });
    });

    test('apiError builds an error payload', () => {
      const res = apiError('Boom', 400);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Boom');
      expect(res.status).toBe(400);
    });
  });

  describe('validation', () => {
    test('validateRequired reports the first missing field', () => {
      expect(validateRequired({ a: 1, b: null }, ['a', 'b'])).toContain('b');
      expect(validateRequired({ a: 1, b: 2 }, ['a', 'b'])).toBeNull();
    });

    test('validateEmail accepts real addresses only', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('not an email')).toBe(false);
    });

    test('validateBandScore enforces 0–9', () => {
      expect(validateBandScore(0)).toBe(true);
      expect(validateBandScore(9)).toBe(true);
      expect(validateBandScore(9.5)).toBe(false);
      expect(validateBandScore(-1)).toBe(false);
    });
  });

  describe('rate limiting', () => {
    test('allows up to maxRequests then blocks within window', () => {
      const key = `test-${Math.random()}`;
      expect(checkRateLimit(key, 3, 60_000)).toBe(true);
      expect(checkRateLimit(key, 3, 60_000)).toBe(true);
      expect(checkRateLimit(key, 3, 60_000)).toBe(true);
      expect(checkRateLimit(key, 3, 60_000)).toBe(false);
    });

    test('resets after the window expires', () => {
      const key = `test-${Math.random()}`;
      expect(checkRateLimit(key, 1, 1)).toBe(true);
      expect(checkRateLimit(key, 1, 1)).toBe(false);
      // window of 1ms — wait and retry
      const start = Date.now();
      while (Date.now() - start < 5) {
        /* busy wait 5ms */
      }
      expect(checkRateLimit(key, 1, 1)).toBe(true);
    });
  });

  describe('sanitization', () => {
    test('sanitizeString strips angle brackets and trims', () => {
      expect(sanitizeString('  <script>alert(1)</script>  ')).not.toContain('<');
      expect(sanitizeString('hello')).toBe('hello');
    });

    test('sanitizeString limits length to 1000', () => {
      expect(sanitizeString('x'.repeat(2000)).length).toBe(1000);
    });

    test('sanitizeObject sanitizes every string value', () => {
      const out = sanitizeObject({ name: '<b>Hi</b>', count: 5 });
      expect(out.name).not.toContain('<');
      expect(out.count).toBe(5);
    });
  });

  describe('pagination', () => {
    test('computes offset/limit with defaults', () => {
      expect(getPaginationParams({})).toEqual({ offset: 0, limit: 20 });
      expect(getPaginationParams({ page: 3, limit: 10 })).toEqual({
        offset: 20,
        limit: 10,
      });
    });

    test('clamps limit to 100 and page to >= 1', () => {
      expect(getPaginationParams({ page: -5, limit: 9999 })).toEqual({
        offset: 0,
        limit: 100,
      });
    });
  });

  describe('handleApiError', () => {
    test('wraps Error instances', () => {
      const res = handleApiError(new Error('db down'));
      expect(res.success).toBe(false);
      expect(res.error).toBe('db down');
      expect(res.status).toBe(500);
    });

    test('handles non-error values', () => {
      const res = handleApiError('weird');
      expect(res.error).toBe('Internal server error');
    });
  });
});
