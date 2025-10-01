// ABOUTME: Dashboard page with Google Analytics connection
// ABOUTME: Protected route - main app interface

import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthContext();

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
              Connect Google Analytics
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You'll be redirected to Google to grant access to your Analytics properties.
              We only request read-only access to your analytics data.
            </p>
            <GoogleOAuthButton />
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