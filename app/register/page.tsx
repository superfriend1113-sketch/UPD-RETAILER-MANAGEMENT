/**
 * Register Page for Retailer Platform
 * Allows new retailers to create an account and submit for approval
 */

import RegisterForm from './RegisterForm';
import Link from 'next/link';

export const metadata = {
  title: 'Register | Retailer Portal',
  description: 'Create your retailer account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Retailer Portal
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-700">
            Create your retailer account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Approval Process</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Your account will be reviewed by our team within 24-48 hours. You'll be redirected to a waiting page after registration and will receive an email notification once approved.</p>
              </div>
            </div>
          </div>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
