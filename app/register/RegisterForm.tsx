'use client';

/**
 * Register Form Component
 * Client-side registration form for new retailers
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/config';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    websiteUrl: '',
    commission: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create auth user with retailer role in metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            role: 'retailer',
            business_name: formData.businessName,
          }
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        
        // Handle specific error cases
        const errorMessage = signUpError.message.toLowerCase();
        
        if (errorMessage.includes('email rate limit exceeded')) {
          setError('Too many signup attempts. Please wait 5-10 minutes before trying again.');
        } else if (errorMessage.includes('user already registered') || errorMessage.includes('already registered')) {
          setError('This email is already registered. Please sign in instead or use a different email address.');
        } else if (errorMessage.includes('invalid email')) {
          setError('Please enter a valid email address.');
        } else if (errorMessage.includes('password')) {
          setError('Password must be at least 6 characters long.');
        } else {
          // Show the actual error for transparency
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account');
        setIsLoading(false);
        return;
      }

      // 2. Create retailer account using database function (bypasses RLS)
      const slug = formData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      console.log('Calling create_retailer_account with:', {
        p_user_id: authData.user.id,
        p_email: formData.email,
        p_business_name: formData.businessName,
        p_slug: slug,
        p_website_url: formData.websiteUrl,
        p_commission: parseFloat(formData.commission) || 0,
      });

      const { data: retailerData, error: retailerError } = await supabase
        .rpc('create_retailer_account', {
          p_user_id: authData.user.id,
          p_email: formData.email,
          p_business_name: formData.businessName,
          p_slug: slug,
          p_website_url: formData.websiteUrl,
          p_commission: parseFloat(formData.commission) || 0,
        });

      console.log('RPC Response:', { data: retailerData, error: retailerError });

      if (retailerError) {
        console.error('Retailer creation error:', retailerError);
        console.error('Error details:', JSON.stringify(retailerError, null, 2));
        
        // Handle specific database errors
        const errorMessage = (retailerError.message || retailerError.hint || String(retailerError)).toLowerCase();
        
        if (errorMessage.includes('already registered') || errorMessage.includes('user already registered')) {
          // Instead of showing error, just redirect to pending page
          // The account exists, just need to check status
          window.location.href = '/pending';
          return;
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) {
          setError('An account with this information already exists. Please sign in or contact support.');
        } else if (retailerError.message) {
          setError('Failed to create retailer account: ' + retailerError.message);
        } else if (retailerError.hint) {
          setError(retailerError.hint);
        } else {
          setError('Failed to create retailer account. Please try again or contact support.');
        }
        setIsLoading(false);
        return;
      }

      console.log('Retailer account created successfully! Retailer ID:', retailerData);

      // 3. Create server-side session via Server Action
      if (!authData.session) {
        setError('Failed to create session');
        setIsLoading(false);
        return;
      }

      console.log('Creating server-side session...');
      const { createSessionAction } = await import('./actions');
      const sessionResult = await createSessionAction(
        authData.session.access_token,
        authData.session.refresh_token
      );

      if (!sessionResult.success) {
        console.error('Failed to create session:', sessionResult.error);
        // Even if session creation fails, still redirect to login
        router.push('/login');
        return;
      }

      console.log('Session created successfully, redirecting to /pending');
      
      // Server Action has set cookies, now redirect
      router.push('/pending');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@retailer.com"
          />
          <Input
            label="Business Name"
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="Your Store Name"
          />
        </div>

        <Input
          label="Website URL"
          type="url"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          required
          placeholder="https://yourstore.com"
        />

        <Input
          label="Commission Rate (%)"
          type="number"
          name="commission"
          value={formData.commission}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
          max="100"
          placeholder="10"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>
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
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  );
}
