'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Auto Refresh Component
 * Automatically checks approval status and redirects when approved
 */
export default function AutoRefresh({ checkInterval = 30000 }: { checkInterval?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Poll for status updates every 30 seconds (default)
    const interval = setInterval(() => {
      router.refresh();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [router, checkInterval]);

  return null;
}
