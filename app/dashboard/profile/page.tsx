/**
 * Profile Page
 * Edit retailer profile information
 */

import { requireRetailer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profile | Retailer Portal',
  description: 'Manage your retailer profile',
};

export default async function ProfilePage() {
  const { retailerId } = await requireRetailer();
  const supabase = await createClient();
  
  const { data: retailer } = await supabase
    .from('retailers')
    .select('*')
    .eq('id', retailerId)
    .single();

  if (!retailer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          Error loading profile
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Retailer Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your business information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProfileForm retailer={retailer} />
      </div>
    </div>
  );
}
