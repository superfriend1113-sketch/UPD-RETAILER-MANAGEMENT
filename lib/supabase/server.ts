/**
 * Supabase Server Client
 * Creates a Supabase client for use in Server Components and Server Actions
 * Automatically handles session management using cookies
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { loadSupabaseEnv } from './env';

/**
 * Create a Supabase client for Server Components
 * This client automatically uses cookies for authentication
 */
export async function createClient() {
  const cookieStore = await cookies();
  const config = loadSupabaseEnv();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.log('Could not set cookies (likely from Server Component):', error);
        }
      },
    },
  });
}
