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
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        // Handle rate limit errors specifically
        if (signUpError.message.toLowerCase().includes('rate limit') || 
            signUpError.message.toLowerCase().includes('email rate limit exceeded')) {
          setError('Too many signup attempts. Please wait a few minutes before trying again, or contact support if you need immediate assistance.');
        } else if (signUpError.message.toLowerCase().includes('already registered') || 
                   signUpError.message.toLowerCase().includes('user already registered')) {
          setError('This email is already registered. Please sign in instead or use a different email address.');
        } else {
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

      const { data: retailerData, error: retailerError } = await supabase
        .rpc('create_retailer_account', {
          p_user_id: authData.user.id,
          p_email: formData.email,
          p_business_name: formData.businessName,
          p_slug: slug,
          p_website_url: formData.websiteUrl,
          p_commission: parseFloat(formData.commission) || 0,
        });

      if (retailerError) {
        setError('Failed to create retailer account: ' + retailerError.message);
        setIsLoading(false);
        return;
      }

      // Show success message and redirect
      alert('Account created! Please check your email to verify your account. Your application will be reviewed by our team.');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
