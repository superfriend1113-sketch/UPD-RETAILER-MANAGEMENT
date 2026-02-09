'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loadSupabaseEnv } from '@/lib/supabase/env';

export async function createSessionAction(accessToken: string, refreshToken: string) {
  try {
    const cookieStore = await cookies();
    const config = loadSupabaseEnv();

    // Create Supabase client with cookie handling
    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    // Set the session
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error('Session creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Session created successfully for user:', data.user?.id);

    return { success: true };
  } catch (error) {
    console.error('Session creation error:', error);
    return { success: false, error: 'Failed to create session' };
  }
}
