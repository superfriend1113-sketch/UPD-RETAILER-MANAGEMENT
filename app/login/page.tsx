/**
 * Login Page for Retailer Platform
 * Allows retailers to sign in to their account
 */

import LoginForm from './LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login | Retailer Portal',
  description: 'Sign in to your retailer account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Retailer Portal
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-700">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new retailer account
            </Link>
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm text-gray-600">
          <p>Need help? Contact support@unlimitedperfectdeals.com</p>
        </div>
      </div>
    </div>
  );
}
