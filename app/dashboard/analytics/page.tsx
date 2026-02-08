/**
 * Analytics Page
 * View deal performance metrics
 */

import { requireRetailer } from '@/lib/auth';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Analytics | Retailer Portal',
  description: 'View your deal performance',
};

async function getDealAnalytics(retailerId: string) {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .eq('retailer_id', retailerId)
    .eq('status', 'approved')
    .order('view_count', { ascending: false });

  if (error) {
    console.error('Error fetching analytics:', error);
    return {
      deals: [],
      totalViews: 0,
      totalClicks: 0,
      averageCTR: 0,
    };
  }

  const totalViews = deals.reduce((sum, d) => sum + (d.view_count || 0), 0);
  const totalClicks = deals.reduce((sum, d) => sum + (d.click_count || 0), 0);
  const averageCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

  return {
    deals,
    totalViews,
    totalClicks,
    averageCTR,
  };
}

export default async function AnalyticsPage() {
  const { retailerId } = await requireRetailer();
  const analytics = await getDealAnalytics(retailerId);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track your deal performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
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
          <p className="text-3xl font-bold text-gray-900">{analytics.totalClicks.toLocaleString()}</p>
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
          <p className="text-3xl font-bold text-gray-900">{analytics.averageCTR.toFixed(2)}%</p>
          <p className="text-sm text-gray-600">Average CTR</p>
        </div>
      </div>

      {/* Top Performing Deals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Deals</h2>
        </div>
        
        {analytics.deals.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No approved deals yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create and submit deals to see analytics.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.deals.map((deal) => {
                  const ctr = deal.view_count > 0 ? ((deal.click_count || 0) / deal.view_count) * 100 : 0;
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {deal.image_url && (
                            <img
                              src={deal.image_url}
                              alt={deal.title}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {deal.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(deal.view_count || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(deal.click_count || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ctr.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(ctr, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{Math.round(ctr)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
