'use client';

import { supabase, isSupabaseConfigured } from './supabase';

// ============================================================
// API Utility Functions
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

// ============================================================
// Authentication Helper
// ============================================================

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return getMockUser();
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }
    return session.user;
  } catch {
    return getMockUser();
  }
}

function getMockUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const mockUser = localStorage.getItem('ieltspro_current_user');
    if (mockUser) {
      const user = JSON.parse(mockUser);
      return {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name }
      };
    }
  } catch {}
  
  return null;
}

export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

// ============================================================
// API Response Helpers
// ============================================================

export function apiSuccess<T>(data: T, status = 200): ApiResponse<T> {
  return { success: true, data, status };
}

export function apiError(message: string, status = 500): ApiResponse {
  return { success: false, error: message, status };
}

// ============================================================
// Request Validation
// ============================================================

export function validateRequired(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateBandScore(score: number): boolean {
  return score >= 0 && score <= 9;
}

// ============================================================
// Rate Limiting (Simple in-memory)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  maxRequests = 100, 
  windowMs = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================================
// Data Sanitization
// ============================================================

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    }
  }
  return sanitized;
}

// ============================================================
// Pagination
// ============================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationParams(params: PaginationParams): { offset: number; limit: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;
  
  return { offset, limit };
}

// ============================================================
// Logging
// ============================================================

export function logApiRequest(
  method: string, 
  path: string, 
  userId?: string | null,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${method} ${path} - User: ${userId || 'anonymous'}${error ? ` - Error: ${error}` : ''}`;
  console.log(log);
}

// ============================================================
// Error Handler
// ============================================================

export function handleApiError(error: unknown): ApiResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return apiError(error.message, 500);
  }
  
  return apiError('Internal server error', 500);
}
