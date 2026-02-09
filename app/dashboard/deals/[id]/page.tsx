/**
 * Edit Deal Page
 * Edit an existing deal
 */

import { requireRetailer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import DealForm from '../new/DealForm';

export const metadata = {
  title: 'Edit Deal | Retailer Portal',
  description: 'Edit your deal',
};

async function getDeal(dealId: string, retailerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .eq('retailer_id', retailerId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getCategories() {
  const supabase = await createClient();
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

export default async function EditDealPage({ params }: { params: { id: string } }) {
  const { retailerId } = await requireRetailer();
  const deal = await getDeal(params.id, retailerId);

  if (!deal) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Deal</h1>
        <p className="mt-2 text-gray-600">
          Update your deal information
        </p>
      </div>

      {deal.status === 'rejected' && deal.rejection_reason && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
              <p className="mt-1 text-sm text-red-700">{deal.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      {deal.status === 'pending' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Pending Review</h3>
              <p className="mt-1 text-sm text-yellow-700">
                This deal is currently being reviewed. Any changes will require re-approval.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <DealForm 
          retailerId={retailerId} 
          categories={categories}
          initialData={{
            id: deal.id,
            title: deal.title,
            description: deal.description,
            original_price: deal.original_price,
            discounted_price: deal.discounted_price,
            category_id: deal.category_id,
            deal_url: deal.deal_url,
            image_url: deal.image_url,
            start_date: deal.start_date,
            end_date: deal.end_date,
            is_active: deal.is_active,
          }}
        />
      </div>
    </div>
  );
}
