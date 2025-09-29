// ABOUTME: Tests for validation utilities
// ABOUTME: Verifies email and password validation logic

import { validateEmail, validatePassword } from '../../utils/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@.com',
        'invalid@example',
        'invalid @example.com',
        '',
        ' ',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('should trim whitespace and validate', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'StrongP@ss1',
        'MySecure1Pass',
        'ComplexPassword123!',
      ];

      strongPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('password123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('PasswordOnly');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Pass1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should return multiple errors for weak passwords', () => {
      const result = validatePassword('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle null and undefined', () => {
      const nullResult = validatePassword(null as any);
      const undefinedResult = validatePassword(undefined as any);

      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors).toContain('Password is required');

      expect(undefinedResult.valid).toBe(false);
      expect(undefinedResult.errors).toContain('Password is required');
    });

    it('should handle empty string', () => {
      const result = validatePassword('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });
});