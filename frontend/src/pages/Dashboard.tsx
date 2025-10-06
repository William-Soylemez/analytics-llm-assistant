// ABOUTME: Dashboard page with Google Analytics connection
// ABOUTME: Protected route - main app interface

import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as authService from '../services/authService';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [oauthMessage, setOauthMessage] = useState<{
    type: 'success' | 'error' | 'denied';
    text: string;
  } | null>(null);

  const disconnectMutation = useMutation({
    mutationFn: authService.disconnectGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setOauthMessage({
        type: 'success',
        text: 'Google Analytics disconnected successfully',
      });
    },
    onError: () => {
      setOauthMessage({
        type: 'error',
        text: 'Failed to disconnect Google Analytics. Please try again.',
      });
    },
  });

  useEffect(() => {
    const oauthStatus = searchParams.get('oauth');
    const message = searchParams.get('message');

    if (oauthStatus === 'success') {
      setOauthMessage({
        type: 'success',
        text: 'Successfully connected to Google Analytics!',
      });
      // Refresh user data to show connected status
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      // Clear query params after showing message
      const timer = setTimeout(() => {
        searchParams.delete('oauth');
        setSearchParams(searchParams);
      }, 100);
      return () => clearTimeout(timer);
    } else if (oauthStatus === 'error') {
      setOauthMessage({
        type: 'error',
        text: message || 'Failed to connect Google Analytics. Please try again.',
      });
      // Clear query params
      const timer = setTimeout(() => {
        searchParams.delete('oauth');
        searchParams.delete('message');
        setSearchParams(searchParams);
      }, 100);
      return () => clearTimeout(timer);
    } else if (oauthStatus === 'denied') {
      setOauthMessage({
        type: 'denied',
        text: message || 'You denied access to Google Analytics.',
      });
      // Clear query params
      const timer = setTimeout(() => {
        searchParams.delete('oauth');
        searchParams.delete('message');
        setSearchParams(searchParams);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">GA Insights Platform</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {oauthMessage && (
          <div
            className={`mb-6 p-4 rounded-md ${
              oauthMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : oauthMessage.type === 'denied'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {oauthMessage.type === 'success' ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className={`h-5 w-5 ${oauthMessage.type === 'denied' ? 'text-yellow-400' : 'text-red-400'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    oauthMessage.type === 'success'
                      ? 'text-green-800'
                      : oauthMessage.type === 'denied'
                        ? 'text-yellow-800'
                        : 'text-red-800'
                  }`}
                >
                  {oauthMessage.text}
                </p>
              </div>
              <div className="ml-3">
                <button
                  onClick={() => setOauthMessage(null)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    oauthMessage.type === 'success'
                      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : oauthMessage.type === 'denied'
                        ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                        : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to GA Insights</h2>
          <p className="text-gray-600 mb-6">
            Connect your Google Analytics account to start viewing insights and analytics data.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Logged in as: <span className="font-medium">{user?.email}</span>
          </p>

          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Google Analytics Connection
            </h3>
            {user?.google_connected ? (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Connected!</p>
                    <p className="text-xs text-gray-600">Your Google Analytics account is connected</p>
                  </div>
                </div>
                <button
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect Google Analytics'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  You'll be redirected to Google to grant access to your Analytics properties.
                  We only request read-only access to your analytics data.
                </p>
                <GoogleOAuthButton />
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Connect your Google Analytics account using the button above</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Select which GA4 properties you want to analyze</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>View your analytics dashboard and generate AI-powered insights</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};