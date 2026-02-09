/**
 * Pending Approval Page
 * Shown to retailers waiting for admin approval
 */

import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AutoRefresh from './AutoRefresh';
import PendingActions from './PendingActions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pending Approval | Retailer Portal',
  description: 'Your account is pending approval',
};

export default async function PendingPage() {
  let uid: string;
  let email: string | undefined;
  
  try {
    const auth = await requireAuth();
    uid = auth.uid;
    email = auth.email;
  } catch (error) {
    // If not authenticated, redirect to login
    redirect('/login');
  }
  
  const supabase = await createClient();

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, retailer:retailer_id(id, name, status, created_at)')
    .eq('id', uid)
    .single();

  console.log('Profile query result:', { profile, profileError });

  // If no profile or not a retailer, redirect to login
  if (!profile || profile.role !== 'retailer') {
    console.log('Redirecting to login:', { hasProfile: !!profile, role: profile?.role });
    redirect('/login');
  }

  // If approved, redirect to dashboard
  if (profile.retailer?.status === 'approved') {
    redirect('/dashboard');
  }

  // If rejected, show rejection message
  const isRejected = profile.retailer?.status === 'rejected';

  // Get retailer details
  const { data: retailer } = await supabase
    .from('retailers')
    .select('*')
    .eq('id', profile.retailer_id)
    .single();

  // Logout function
  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Auto-refresh component - checks status every 30 seconds */}
      <AutoRefresh checkInterval={30000} />
      
      <div className="max-w-2xl w-full">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${isRejected ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              {isRejected ? (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isRejected ? 'Application Declined' : 'Application Under Review'}
            </h1>
            <p className="text-white/90 text-lg">
              {isRejected ? 'Your retailer application has been reviewed' : 'Your account is being verified by our team'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {isRejected ? (
              <>
                {/* Rejection Info */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-red-900 mb-2">Application Status: Rejected</h2>
                  {retailer?.rejection_reason && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                      <p className="text-sm text-red-700">{retailer.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What you can do:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Contact our support team at <a href="mailto:support@unlimitedperfectdeals.com" className="text-blue-600 hover:underline">support@unlimitedperfectdeals.com</a> for more information</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Review the reason above and consider reapplying with updated information</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Account Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pending Review
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-sm text-gray-600">Business Name</span>
                      <span className="text-sm font-medium text-gray-900">{retailer?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-sm text-gray-600">Email Address</span>
                      <span className="text-sm font-medium text-gray-900">{email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Submitted On</span>
                      <span className="text-sm font-medium text-gray-900">
                        {retailer?.created_at ? new Date(retailer.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What happens next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                        <p className="text-xs text-gray-500 mt-1">Your application has been received successfully</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shrink-0 animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Under Review</p>
                        <p className="text-xs text-gray-500 mt-1">Our team is currently reviewing your information</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Decision & Notification</p>
                        <p className="text-xs text-gray-500 mt-1">You'll receive an email once your application is approved</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Access Dashboard</p>
                        <p className="text-xs text-gray-500 mt-1">Start creating deals and managing your retailer account</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Typical Review Time</p>
                      <p className="text-xs text-gray-600 mt-1">Most applications are reviewed within 24-48 hours</p>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      If you have questions about your application, please contact us:
                    </p>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href="mailto:support@unlimitedperfectdeals.com" className="text-blue-600 hover:underline">
                        support@unlimitedperfectdeals.com
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <PendingActions isRejected={isRejected} handleLogout={handleLogout} />
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          This page will automatically redirect once your application is approved
        </p>
      </div>
    </div>
  );
}
