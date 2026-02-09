/**
 * Retailer Management Platform - Home Page
 * Redirects to login or shows welcome page
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is logged in, check their status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, retailer_id')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'retailer' && profile.retailer_id) {
      // Get retailer status
      const { data: retailer } = await supabase
        .from('retailers')
        .select('status')
        .eq('id', profile.retailer_id)
        .single();

      // Redirect based on retailer status
      if (retailer?.status === 'approved') {
        redirect('/dashboard');
      } else {
        redirect('/pending');
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Unlimited Perfect Deals
            </h1>
            <p className="text-lg text-gray-600">
              Retailer Management Portal
            </p>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              Manage your deals, track performance, and grow your business.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign In to Your Account
            </Link>
            
            <Link
              href="/register"
              className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 transition-colors"
            >
              Create New Account
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
