// ============================================================
// API Error Handling (Phase 5.4)
// ============================================================

import { toast } from './toast';
import type { ApiResponse } from './api-utils';

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

/** Normalize any thrown value into a user-friendly message. */
export function getErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

/** Map HTTP status codes to friendly messages. */
export function statusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Noto'g'ri so'rov yuborildi";
    case 401:
      return "Sessiyangiz tugagan. Iltimos, qayta kiring";
    case 403:
      return 'Bu amalni bajarishga ruxsatingiz yo\'q';
    case 404:
      return 'Ma\'lumot topilmadi';
    case 409:
      return 'Ma\'lumot allaqachon mavjud';
    case 429:
      return "Juda ko'p so'rov yuborildi. Biroz kuting";
    case 500:
      return 'Serverda xatolik yuz berdi';
    case 502:
    case 503:
    case 504:
      return 'Xizmat vaqtincha mavjud emas';
    default:
      return status >= 500 ? 'Serverda xatolik yuz berdi' : 'Xatolik yuz berdi';
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  retries?: number;
  retryDelayMs?: number;
  silent?: boolean; // don't show a toast on error
}

/**
 * Fetch wrapper with automatic JSON handling, error normalization
 * and optional retry with exponential backoff.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    body,
    retries = 2,
    retryDelayMs = 500,
    silent = false,
    headers,
    ...rest
  } = options;

  let lastError: ApiRequestError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...rest,
        headers: {
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(headers || {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        let message = statusMessage(response.status);
        let code: string | undefined;
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
          if (data?.code) code = data.code;
        } catch {
          // non-JSON error body — keep status message
        }
        const error = new ApiRequestError(message, response.status, code);

        // Retry only on server errors and rate limits
        if ((response.status >= 500 || response.status === 429) && attempt < retries) {
          lastError = error;
          await delay(retryDelayMs * Math.pow(2, attempt));
          continue;
        }

        if (!silent) toast.error('Xatolik', message);
        throw error;
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        // Already handled/retried above — rethrow when exhausted
        if (err.status < 500 && err.status !== 429) {
          if (!silent && !(err instanceof ApiRequestError && err.message)) {
            toast.error('Xatolik', err.message);
          }
          throw err;
        }
        lastError = err;
        if (attempt < retries) {
          await delay(retryDelayMs * Math.pow(2, attempt));
          continue;
        }
        if (!silent) toast.error('Xatolik', err.message);
        throw err;
      }

      // Network error
      const networkError = new ApiRequestError(
        'Internet aloqasi uzildi. Tekshirib, qayta urinib ko\'ring',
        0
      );
      lastError = networkError;
      if (attempt < retries) {
        await delay(retryDelayMs * Math.pow(2, attempt));
        continue;
      }
      if (!silent) toast.error('Xatolik', networkError.message);
      throw networkError;
    }
  }

  throw lastError || new ApiRequestError('Xatolik yuz berdi', 500);
}

/** Unwrap an ApiResponse-style payload. */
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.error) {
    throw new ApiRequestError(res.error || 'Xatolik yuz berdi', res.status);
  }
  return res.data as T;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
