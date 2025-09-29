// ABOUTME: Authentication service handling user registration and login
// ABOUTME: Manages token generation and refresh token blacklist via Redis

import * as UserModel from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { validateEmail, validatePassword } from '../utils/validators';
import { ValidationError, AuthError } from '../utils/errors';
import redis from '../config/redis';

const REFRESH_TOKEN_BLACKLIST_PREFIX = 'blacklist:refresh:';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const register = async (input: RegisterInput): Promise<AuthTokens> => {
  if (!validateEmail(input.email)) {
    throw new ValidationError('Invalid email address');
  }

  const passwordValidation = validatePassword(input.password);
  if (!passwordValidation.valid) {
    throw new ValidationError(passwordValidation.errors.join(', '));
  }

  const existingUser = await UserModel.findByEmail(input.email);
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  const user = await UserModel.create({
    email: input.email,
    password: input.password,
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
  };
};

export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const user = await UserModel.findByEmail(input.email);

  if (!user || !user.password_hash) {
    throw new AuthError('Invalid email or password');
  }

  const isValidPassword = await UserModel.verifyPassword(input.password, user.password_hash);

  if (!isValidPassword) {
    throw new AuthError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string): Promise<string> => {
  const isBlacklisted = await redis.get(`${REFRESH_TOKEN_BLACKLIST_PREFIX}${refreshToken}`);

  if (isBlacklisted) {
    throw new AuthError('Refresh token has been revoked');
  }

  const payload = verifyRefreshToken(refreshToken);

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw new AuthError('User not found');
  }

  const newAccessToken = generateAccessToken(user.id);

  return newAccessToken;
};

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    await redis.setex(
      `${REFRESH_TOKEN_BLACKLIST_PREFIX}${refreshToken}`,
      sevenDaysInSeconds,
      'true'
    );
  } catch (error) {
    // Token is already invalid, no need to blacklist
  }
};