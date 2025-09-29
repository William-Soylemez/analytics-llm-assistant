// ABOUTME: Tests for JWT token utilities
// ABOUTME: Verifies token generation and verification for access and refresh tokens

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/jwt';

describe('JWT Utils', () => {
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateAccessToken(testUserId);
      const token2 = generateAccessToken('different-user-id');

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testUserId);
      const payload = verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(testUserId);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow('Invalid access token');
    });

    it('should throw error for empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });

    it('should throw error for refresh token used as access token', () => {
      const refreshToken = generateRefreshToken(testUserId);
      expect(() => verifyAccessToken(refreshToken)).toThrow('Invalid access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      const payload = verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(testUserId);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow('Invalid refresh token');
    });

    it('should throw error for access token used as refresh token', () => {
      const accessToken = generateAccessToken(testUserId);
      expect(() => verifyRefreshToken(accessToken)).toThrow('Invalid refresh token');
    });
  });

  describe('Token round-trip', () => {
    it('should maintain userId through generation and verification', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        'abc12345-e89b-12d3-a456-426614174999',
        'def98765-e89b-12d3-a456-426614174888',
      ];

      userIds.forEach((userId) => {
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);

        const accessPayload = verifyAccessToken(accessToken);
        const refreshPayload = verifyRefreshToken(refreshToken);

        expect(accessPayload.userId).toBe(userId);
        expect(refreshPayload.userId).toBe(userId);
      });
    });
  });
});