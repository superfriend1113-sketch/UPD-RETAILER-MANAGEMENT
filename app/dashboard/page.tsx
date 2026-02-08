/**
 * Dashboard Home Page
 * Main dashboard for retailers
 */

import { requireRetailer } from '@/lib/auth';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard | Retailer Portal',
  description: 'Manage your deals and track performance',
};

async function getDashboardMetrics(retailerId: string) {
  // Fetch retailer's deals
  const { data: deals, error } = await supabase
    .from('deals')
    .select('id, status, is_active, view_count, click_count')
    .eq('retailer_id', retailerId);

  if (error) {
    console.error('Error fetching deals:', error);
    return {
      totalDeals: 0,
      pendingDeals: 0,
      approvedDeals: 0,
      rejectedDeals: 0,
      totalViews: 0,
      totalClicks: 0,
    };
  }

  const totalDeals = deals?.length || 0;
  const pendingDeals = deals?.filter(d => d.status === 'pending').length || 0;
  const approvedDeals = deals?.filter(d => d.status === 'approved').length || 0;
  const rejectedDeals = deals?.filter(d => d.status === 'rejected').length || 0;
  const totalViews = deals?.reduce((sum, d) => sum + (d.view_count || 0), 0) || 0;
  const totalClicks = deals?.reduce((sum, d) => sum + (d.click_count || 0), 0) || 0;

  return {
    totalDeals,
    pendingDeals,
    approvedDeals,
    rejectedDeals,
    totalViews,
    totalClicks,
  };
}

export default async function DashboardPage() {
  const { email, retailerId, profile } = await requireRetailer();
  
  // Fetch retailer info
  const { data: retailer } = await supabase
    .from('retailers')
    .select('*')
    .eq('id', retailerId)
    .single();

  const metrics = await getDashboardMetrics(retailerId);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {retailer?.name || email}
        </p>
      </div>

      {/* Account Status Alert */}
      {retailer?.status === 'pending' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Account Pending Approval</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your retailer account is being reviewed. You'll be able to submit deals once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {retailer?.status === 'rejected' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Account Rejected</h3>
              <p className="mt-1 text-sm text-red-700">
                {retailer.rejection_reason || 'Your account application was not approved. Please contact support for more information.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalDeals}</p>
          <p className="text-sm text-gray-600">Total Deals</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.pendingDeals}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.approvedDeals}</p>
          <p className="text-sm text-gray-600">Approved Deals</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Views</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalClicks.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Clicks</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.totalClicks > 0 ? ((metrics.totalClicks / metrics.totalViews) * 100).toFixed(1) : '0'}%
          </p>
          <p className="text-sm text-gray-600">Click-through Rate</p>
        </div>
      </div>

      {/* Quick Actions */}
      {retailer?.status === 'approved' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/deals/new"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Deal</p>
                <p className="text-sm text-gray-600">Submit a new deal</p>
              </div>
            </a>

            <a
              href="/dashboard/deals"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Deals</p>
                <p className="text-sm text-gray-600">View and edit deals</p>
              </div>
            </a>

            <a
              href="/dashboard/profile"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Profile</p>
                <p className="text-sm text-gray-600">Update your info</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
