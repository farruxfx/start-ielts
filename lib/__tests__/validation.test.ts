import {
  signInSchema,
  signUpSchema,
  profileSchema,
  validate,
  fieldErrors,
} from '../validation';

describe('Form Validation (Zod)', () => {
  describe('signInSchema', () => {
    test('accepts valid credentials', () => {
      const { data, errors } = validate(signInSchema, {
        email: 'user@example.com',
        password: 'secret123',
      });
      expect(errors).toEqual({});
      expect(data).toEqual({ email: 'user@example.com', password: 'secret123' });
    });

    test('rejects invalid email', () => {
      const { data, errors } = validate(signInSchema, {
        email: 'not-an-email',
        password: 'secret123',
      });
      expect(data).toBeNull();
      expect(errors.email).toBeTruthy();
    });

    test('rejects short password', () => {
      const { errors } = validate(signInSchema, {
        email: 'user@example.com',
        password: '123',
      });
      expect(errors.password).toBeTruthy();
    });

    test('requires email', () => {
      const { errors } = validate(signInSchema, { email: '', password: 'secret123' });
      expect(errors.email).toBeTruthy();
    });
  });

  describe('signUpSchema', () => {
    test('accepts valid registration', () => {
      const { data, errors } = validate(signUpSchema, {
        name: 'Aziz',
        email: 'aziz@example.com',
        password: 'password1',
      });
      expect(errors).toEqual({});
      expect(data?.name).toBe('Aziz');
    });

    test('rejects short name', () => {
      const { errors } = validate(signUpSchema, {
        name: 'A',
        email: 'aziz@example.com',
        password: 'password1',
      });
      expect(errors.name).toBeTruthy();
    });
  });

  describe('profileSchema', () => {
    test('accepts valid profile with band 0–9', () => {
      const { errors } = validate(profileSchema, {
        name: 'Student',
        target_band: 7.5,
        exam_date: '2026-12-01',
      });
      expect(errors).toEqual({});
    });

    test('rejects band score outside 0–9', () => {
      const { errors } = validate(profileSchema, {
        name: 'Student',
        target_band: 11,
      });
      expect(errors.target_band).toBeTruthy();
    });
  });

  describe('fieldErrors', () => {
    test('maps first error per field', () => {
      const result = signInSchema.safeParse({ email: '', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = fieldErrors(result.error);
        expect(Object.keys(errors).sort()).toEqual(['email', 'password']);
      }
    });
  });
});
