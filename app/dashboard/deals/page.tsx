/**
 * Deals List Page
 * View all deals submitted by this retailer
 */

import { requireRetailer } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase/config';
import Link from 'next/link';
import type { Deal } from '@/types/deal';

export const metadata = {
  title: 'My Deals | Retailer Portal',
  description: 'Manage your submitted deals',
};

async function getRetailerDeals(retailerId: string) {
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      category:categories(id, name, slug),
      retailer:retailers(id, name, slug)
    `)
    .eq('retailer_id', retailerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }

  return deals as any[]; // Database returns snake_case fields
}

export default async function DealsPage() {
  const { retailerId } = await requireRetailer();
  const deals = await getRetailerDeals(retailerId);

  const pendingDeals = deals.filter(d => d.status === 'pending');
  const approvedDeals = deals.filter(d => d.status === 'approved');
  const rejectedDeals = deals.filter(d => d.status === 'rejected');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
          <p className="mt-2 text-gray-600">
            Manage all your submitted deals
          </p>
        </div>
        <Link
          href="/dashboard/deals/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Deals</p>
          <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingDeals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedDeals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejectedDeals.length}</p>
        </div>
      </div>

      {/* Deals List */}
      {deals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deals yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first deal.</p>
          <div className="mt-6">
            <Link
              href="/dashboard/deals/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Deal
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {deal.image_url && (
                        <img
                          src={deal.image_url}
                          alt={deal.product_name}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      )}
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {deal.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${(deal.original_price / 100).toFixed(2)} → ${(deal.price / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${deal.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${deal.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.view_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.click_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/dashboard/deals/${deal.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    {deal.rejection_reason && (
                      <button
                        onClick={() => alert(deal.rejection_reason)}
                        className="text-red-600 hover:text-red-900"
                      >
                        View Reason
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
