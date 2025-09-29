// ABOUTME: Tests for encryption utilities
// ABOUTME: Verifies token encryption and decryption functionality

import { encryptToken, decryptToken } from '../utils/encryption';

describe('Encryption Utils', () => {
  const testToken = 'test-oauth-token-12345';

  describe('encryptToken', () => {
    it('should encrypt a token', () => {
      const encrypted = encryptToken(testToken);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testToken);
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should produce different encrypted values for same input', () => {
      const encrypted1 = encryptToken(testToken);
      const encrypted2 = encryptToken(testToken);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error for empty token', () => {
      expect(() => encryptToken('')).toThrow('Token cannot be empty');
    });
  });

  describe('decryptToken', () => {
    it('should decrypt an encrypted token', () => {
      const encrypted = encryptToken(testToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(testToken);
    });

    it('should handle special characters', () => {
      const specialToken = 'token-with-special-chars-!@#$%^&*()';
      const encrypted = encryptToken(specialToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(specialToken);
    });

    it('should throw error for invalid format', () => {
      expect(() => decryptToken('invalid-format')).toThrow('Invalid encrypted token format');
    });

    it('should throw error for empty encrypted token', () => {
      expect(() => decryptToken('')).toThrow('Encrypted token cannot be empty');
    });
  });

  describe('Round-trip encryption', () => {
    it('should maintain data integrity through encryption/decryption', () => {
      const tokens = [
        'simple-token',
        'token-with-dashes-and-numbers-123',
        'very-long-token-that-has-many-characters-to-test-larger-payloads-12345678901234567890',
      ];

      tokens.forEach((token) => {
        const encrypted = encryptToken(token);
        const decrypted = decryptToken(encrypted);
        expect(decrypted).toBe(token);
      });
    });
  });
});