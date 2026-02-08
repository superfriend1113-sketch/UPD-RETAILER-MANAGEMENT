'use client';

/**
 * Auth Provider Component
 * Wraps the app to provide authentication context
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear any local state
        window.location.href = '/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
