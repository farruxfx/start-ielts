import { ApiRequestError, getErrorMessage, statusMessage, unwrap, apiFetch } from '../api-errors';
import type { ApiResponse } from '../api-utils';

describe('API Error Handling', () => {
  describe('statusMessage', () => {
    test('maps common statuses to friendly messages', () => {
      expect(statusMessage(401)).toContain('qayta kiring');
      expect(statusMessage(404)).toContain('topilmadi');
      expect(statusMessage(429)).toContain('Biroz kuting');
      expect(statusMessage(500)).toContain('Server');
      expect(statusMessage(418)).toBeTruthy();
    });
  });

  describe('getErrorMessage', () => {
    test('extracts messages from Error instances', () => {
      expect(getErrorMessage(new Error('oops'))).toBe('oops');
    });

    test('uses fallback for unknown values', () => {
      expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
      expect(getErrorMessage({ weird: true })).toBe('Xatolik yuz berdi');
    });

    test('passes through strings', () => {
      expect(getErrorMessage('network gone')).toBe('network gone');
    });
  });

  describe('unwrap', () => {
    test('returns data on success', () => {
      const res: ApiResponse<number> = { success: true, data: 42, status: 200 };
      expect(unwrap(res)).toBe(42);
    });

    test('throws ApiRequestError on failure', () => {
      const res: ApiResponse = { success: false, error: 'bad', status: 400 };
      expect(() => unwrap(res)).toThrow(ApiRequestError);
      try {
        unwrap(res);
      } catch (e) {
        expect((e as ApiRequestError).message).toBe('bad');
        expect((e as ApiRequestError).status).toBe(400);
      }
    });
  });

  describe('apiFetch', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      jest.restoreAllMocks();
    });

    test('returns parsed JSON on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ hello: 'world' }),
      }) as unknown as typeof fetch;

      const data = await apiFetch<{ hello: string }>('/api/test', { retries: 0 });
      expect(data.hello).toBe('world');
    });

    test('throws ApiRequestError with server message on 4xx', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Noto'g'ri so'rov" }),
      }) as unknown as typeof fetch;

      await expect(
        apiFetch('/api/test', { retries: 0, silent: true })
      ).rejects.toThrow("Noto'g'ri so'rov");
    });

    test('retries on 500 then succeeds', async () => {
      let calls = 0;
      global.fetch = jest.fn().mockImplementation(async () => {
        calls++;
        if (calls === 1) {
          return { ok: false, status: 500, json: async () => ({ error: 'boom' }) };
        }
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      }) as unknown as typeof fetch;

      const data = await apiFetch<{ ok: boolean }>('/api/test', {
        retries: 2,
        retryDelayMs: 1,
        silent: true,
      });
      expect(data.ok).toBe(true);
      expect(calls).toBe(2);
    });

    test('serializes JSON body and sets content-type', async () => {
      const mock = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
      global.fetch = mock as unknown as typeof fetch;

      await apiFetch('/api/test', {
        method: 'POST',
        body: { a: 1 },
        retries: 0,
      });

      const [, init] = mock.mock.calls[0];
      expect(init.body).toBe(JSON.stringify({ a: 1 }));
      expect(init.headers['Content-Type']).toBe('application/json');
    });
  });
});
