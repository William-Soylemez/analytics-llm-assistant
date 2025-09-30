// ABOUTME: Authentication service for API calls
// ABOUTME: Handles registration, login, logout, and user management

import api from './api';

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  subscription_tier: string;
  daily_digest_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  user: User;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

/**
 * Login with email and password
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

/**
 * Logout - revoke refresh token
 */
export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await api.post('/api/auth/logout', { refreshToken });
    } catch (error) {
      // Logout anyway even if API call fails
      console.error('Logout API call failed:', error);
    }
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await api.post<{ accessToken: string }>('/api/auth/refresh', {
    refreshToken,
  });

  return response.data.accessToken;
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<UserResponse>('/api/auth/me');
  return response.data.user;
};