'use client';

/**
 * Login Form Component
 * Client-side login form with validation
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/config';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setError('Failed to create session');
        setIsLoading(false);
        return;
      }

      // Create server-side session
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        }),
      });

      if (!response.ok) {
        setError('Failed to authenticate. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check user profile and retailer status
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, retailer_id')
        .eq('id', data.user.id)
        .single();

      // Check if user is a retailer
      if (profile?.role === 'retailer' && profile.retailer_id) {
        // Get retailer status
        const { data: retailer } = await supabase
          .from('retailers')
          .select('status')
          .eq('id', profile.retailer_id)
          .single();

        // Check retailer status
        if (retailer?.status === 'approved') {
          // Approved retailer - go to dashboard
          router.push('/dashboard');
        } else {
          // Pending or rejected - go to pending page
          router.push('/pending');
        }
      } else {
        // Not a retailer - go to dashboard anyway (will be handled by layout)
        router.push('/dashboard');
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@retailer.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
