/**
 * Supabase Environment Variables for Retailer Platform
 * Browser-safe environment configuration
 */

interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Load and validate Supabase environment variables
 * @returns Validated environment configuration
 * @throws Error if required variables are missing
 */
export function loadSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate required variables
  const missing: string[] = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    const errorMessage = `Missing required Supabase environment variables: ${missing.join(', ')}

Please follow these steps:

1. Copy .env.example to .env.local:
   cp .env.example .env.local

2. Fill in your Supabase credentials from Supabase Dashboard > Project Settings > API

3. Restart the development server
`;
    throw new Error(errorMessage);
  }

  // At this point, url and anonKey are guaranteed to be defined
  // Basic URL validation
  if (!url!.startsWith('http://') && !url!.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL starting with http:// or https://');
  }

  return { url: url!, anonKey: anonKey! };
}
