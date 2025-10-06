// ABOUTME: User model with database operations
// ABOUTME: Handles CRUD operations for users with secure password handling

import { query } from '../config/database';
import bcrypt from 'bcrypt';
import { encryptToken, decryptToken } from '../utils/encryption';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  google_refresh_token?: string;
  google_access_token?: string;
  token_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
  subscription_tier: string;
  daily_digest_enabled: boolean;
}

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  google_refresh_token?: string | null;
  google_access_token?: string | null;
  token_expires_at?: Date | null;
  subscription_tier?: string;
  daily_digest_enabled?: boolean;
}

const SALT_ROUNDS = 10;

export const create = async (input: CreateUserInput): Promise<User> => {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at, updated_at, subscription_tier, daily_digest_enabled`,
    [input.email, passwordHash]
  );

  return result.rows[0];
};

export const findById = async (id: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, email, created_at, updated_at, subscription_tier, daily_digest_enabled,
            google_refresh_token, google_access_token, token_expires_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

export const findByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, email, password_hash, created_at, updated_at, subscription_tier, daily_digest_enabled,
            google_refresh_token, google_access_token, token_expires_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

export const update = async (id: string, input: UpdateUserInput): Promise<User | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(input.email);
  }

  if (input.password !== undefined) {
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    updates.push(`password_hash = $${paramCount++}`);
    values.push(passwordHash);
  }

  if (input.google_refresh_token !== undefined) {
    updates.push(`google_refresh_token = $${paramCount++}`);
    values.push(input.google_refresh_token);
  }

  if (input.google_access_token !== undefined) {
    updates.push(`google_access_token = $${paramCount++}`);
    values.push(input.google_access_token);
  }

  if (input.token_expires_at !== undefined) {
    updates.push(`token_expires_at = $${paramCount++}`);
    values.push(input.token_expires_at);
  }

  if (input.subscription_tier !== undefined) {
    updates.push(`subscription_tier = $${paramCount++}`);
    values.push(input.subscription_tier);
  }

  if (input.daily_digest_enabled !== undefined) {
    updates.push(`daily_digest_enabled = $${paramCount++}`);
    values.push(input.daily_digest_enabled);
  }

  if (updates.length === 0) {
    return findById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, email, created_at, updated_at, subscription_tier, daily_digest_enabled`,
    values
  );

  return result.rows[0] || null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Update Google OAuth tokens for a user
 */
export const updateGoogleTokens = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> => {
  const encryptedAccessToken = encryptToken(accessToken);
  const encryptedRefreshToken = encryptToken(refreshToken);

  await query(
    `UPDATE users
     SET google_access_token = $1,
         google_refresh_token = $2,
         token_expires_at = $3,
         updated_at = NOW()
     WHERE id = $4`,
    [encryptedAccessToken, encryptedRefreshToken, expiresAt, userId]
  );
};

/**
 * Get decrypted Google tokens for a user
 */
export const getGoogleTokens = async (userId: string): Promise<GoogleTokens | null> => {
  const result = await query(
    `SELECT google_access_token, google_refresh_token, token_expires_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const row = result.rows[0];
  if (!row || !row.google_access_token || !row.google_refresh_token) {
    return null;
  }

  return {
    accessToken: decryptToken(row.google_access_token),
    refreshToken: decryptToken(row.google_refresh_token),
    expiresAt: row.token_expires_at,
  };
};