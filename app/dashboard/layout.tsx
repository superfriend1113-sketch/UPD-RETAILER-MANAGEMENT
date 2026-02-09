/**
 * Dashboard Layout
 * Protected layout for retailer dashboard
 */

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  try {
    const { uid } = await requireAuth();
    const supabase = await createClient();

    // Get user profile and retailer status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, retailer_id')
      .eq('id', uid)
      .single();

    // Check if user is a retailer
    if (!profile || profile.role !== 'retailer') {
      redirect('/login');
    }

    // Check retailer status
    if (profile.retailer_id) {
      const { data: retailer } = await supabase
        .from('retailers')
        .select('status')
        .eq('id', profile.retailer_id)
        .single();

      // Redirect to pending page if not approved
      if (retailer?.status !== 'approved') {
        redirect('/pending');
      }
    } else {
      // No retailer account linked, redirect to pending
      redirect('/pending');
    }
  } catch (error) {
    // Redirect to login if not authenticated
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header spacer */}
        <div className="h-14 lg:hidden" />
        
        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
