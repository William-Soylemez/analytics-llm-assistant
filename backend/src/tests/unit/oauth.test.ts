// ABOUTME: Unit tests for OAuth service
// ABOUTME: Tests OAuth URL generation, callback handling, and token management

import * as oauthService from '../../services/oauth.service';
import * as UserModel from '../../models/user.model';
import redis from '../../config/redis';

// Mock the dependencies
jest.mock('../../models/user.model');
jest.mock('../../config/oauth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    generateAuthUrl: jest.fn(() => 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'),
    getToken: jest.fn(() =>
      Promise.resolve({
        tokens: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expiry_date: Date.now() + 3600000,
        },
      })
    ),
    setCredentials: jest.fn(),
    refreshAccessToken: jest.fn(() =>
      Promise.resolve({
        credentials: {
          access_token: 'new-access-token',
          expiry_date: Date.now() + 3600000,
        },
      })
    ),
  })),
  GOOGLE_OAUTH_SCOPES: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
}));

describe('OAuth Service', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL with state', async () => {
      const url = await oauthService.getAuthorizationUrl(mockUserId);

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test');
    });

    it('should store state in Redis', async () => {
      const setSpy = jest.spyOn(redis, 'set');

      await oauthService.getAuthorizationUrl(mockUserId);

      expect(setSpy).toHaveBeenCalledWith(
        expect.stringContaining('oauth:state:'),
        mockUserId,
        'EX',
        600
      );
    });
  });

  describe('handleCallback', () => {
    const mockCode = 'test-auth-code';
    const mockState = 'test-state-123';

    it('should validate state parameter', async () => {
      const getSpy = jest.spyOn(redis, 'get').mockResolvedValue(null);

      await expect(oauthService.handleCallback(mockCode, mockState)).rejects.toThrow(
        'Invalid or expired OAuth state'
      );

      expect(getSpy).toHaveBeenCalledWith(`oauth:state:${mockState}`);
    });

    it('should exchange code for tokens and store them', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(mockUserId);
      jest.spyOn(redis, 'del').mockResolvedValue(1);
      const updateSpy = jest
        .spyOn(UserModel, 'updateGoogleTokens')
        .mockResolvedValue(undefined);

      const result = await oauthService.handleCallback(mockCode, mockState);

      expect(result.userId).toBe(mockUserId);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(updateSpy).toHaveBeenCalledWith(
        mockUserId,
        'test-access-token',
        'test-refresh-token',
        expect.any(Date)
      );
    });

    it('should delete state after successful callback', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(mockUserId);
      const delSpy = jest.spyOn(redis, 'del').mockResolvedValue(1);
      jest.spyOn(UserModel, 'updateGoogleTokens').mockResolvedValue(undefined);

      await oauthService.handleCallback(mockCode, mockState);

      expect(delSpy).toHaveBeenCalledWith(`oauth:state:${mockState}`);
    });
  });

  describe('getValidAccessToken', () => {
    it('should return existing token if not expired', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      jest.spyOn(UserModel, 'getGoogleTokens').mockResolvedValue({
        accessToken: 'existing-token',
        refreshToken: 'refresh-token',
        expiresAt: futureDate,
      });

      const token = await oauthService.getValidAccessToken(mockUserId);

      expect(token).toBe('existing-token');
    });

    it('should refresh token if expired', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      jest
        .spyOn(UserModel, 'getGoogleTokens')
        .mockResolvedValueOnce({
          accessToken: 'old-token',
          refreshToken: 'refresh-token',
          expiresAt: pastDate,
        })
        .mockResolvedValueOnce({
          accessToken: 'old-token',
          refreshToken: 'refresh-token',
          expiresAt: pastDate,
        });

      jest.spyOn(UserModel, 'updateGoogleTokens').mockResolvedValue(undefined);

      const token = await oauthService.getValidAccessToken(mockUserId);

      expect(token).toBe('new-access-token');
    });

    it('should throw error if no tokens exist', async () => {
      jest.spyOn(UserModel, 'getGoogleTokens').mockResolvedValue(null);

      await expect(oauthService.getValidAccessToken(mockUserId)).rejects.toThrow(
        'User has not connected Google account'
      );
    });
  });
});