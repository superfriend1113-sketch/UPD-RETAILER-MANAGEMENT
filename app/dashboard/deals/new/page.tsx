/**
 * New Deal Page
 * Create a new deal submission
 */

import { requireRetailer } from '@/lib/auth';
import { supabase } from '@/lib/supabase/config';
import { redirect } from 'next/navigation';
import DealForm from './DealForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Deal | Retailer Portal',
  description: 'Submit a new deal for approval',
};

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

export default async function NewDealPage() {
  const { retailerId, profile } = await requireRetailer();
  
  // Get retailer info to check status
  const { data: retailer } = await supabase
    .from('retailers')
    .select('*')
    .eq('id', retailerId)
    .single();

  // If retailer is not approved, redirect to dashboard
  if (retailer?.status !== 'approved') {
    redirect('/dashboard');
  }

  const categories = await getCategories();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Deal</h1>
        <p className="mt-2 text-gray-600">
          Submit a new deal for admin approval
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Review Process</h3>
            <p className="mt-1 text-sm text-blue-700">
              Your deal will be reviewed by our team before being published. You'll be notified once it's approved or if changes are needed.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <DealForm retailerId={retailerId} categories={categories} />
      </div>
    </div>
  );
}
