/**
 * Dashboard Layout
 * Protected layout for retailer dashboard
 */

import { redirect } from 'next/navigation';
import { requireRetailer } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check with retailer role requirement
  try {
    await requireRetailer();
  } catch (error) {
    // Redirect to login if not authenticated or not a retailer
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
