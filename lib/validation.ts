// ============================================================
// Form Validation Schemas (Phase 5.7 — Zod)
// ============================================================

import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email kiritish majburiy')
  .email('Noto\'g\'ri email formati');

export const passwordSchema = z
  .string()
  .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak')
    .max(100, 'Ism juda uzun'),
  email: emailSchema,
  password: passwordSchema,
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat').max(100),
  target_band: z
    .number()
    .min(0, 'Band 0 dan past bo\'lmasligi kerak')
    .max(9, 'Band 9 dan yuqori bo\'lmasligi kerak')
    .refine(v => Number.isFinite(v), 'Noto\'g\'ri band score'),
  exam_date: z
    .string()
    .optional()
    .refine(v => !v || !Number.isNaN(Date.parse(v)), 'Noto\'g\'ri sana formati'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

/** Convert a ZodError into a flat field → message map. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() || '_';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Safe-parse helper returning `{ data, errors }`. */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  values: unknown
): { data: z.infer<T> | null; errors: Record<string, string> } {
  const result = schema.safeParse(values);
  if (result.success) {
    return { data: result.data as z.infer<T>, errors: {} };
  }
  return { data: null, errors: fieldErrors(result.error) };
}
