// ABOUTME: Google OAuth 2.0 configuration
// ABOUTME: Defines client settings and scopes for Google Analytics API access

import { google } from 'googleapis';

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing required Google OAuth environment variables');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

export default getOAuthClient;