// ABOUTME: Registration page
// ABOUTME: Displays registration form centered on the page

import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          GA Insights Platform
        </h1>
      </div>
      <RegisterForm />
    </div>
  );
};