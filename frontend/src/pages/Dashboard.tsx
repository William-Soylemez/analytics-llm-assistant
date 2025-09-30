// ABOUTME: Dashboard page (placeholder)
// ABOUTME: Protected route - main app interface

import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to GA Insights</h2>
          <p className="text-gray-600 mb-4">
            You're now logged in. Dashboard features will be implemented in the next phase.
          </p>
          <p className="text-sm text-gray-500">
            Logged in as: <span className="font-medium">{user?.email}</span>
          </p>
        </div>
      </main>
    </div>
  );
};