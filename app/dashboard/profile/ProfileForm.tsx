'use client';

/**
 * Profile Form Component
 * Form for editing retailer profile
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/config';

interface ProfileFormProps {
  retailer: {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
    website_url: string;
    commission: string;
    affiliate_id: string;
    status: string;
  };
}

export default function ProfileForm({ retailer }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: retailer.name,
    logo_url: retailer.logo_url || '',
    website_url: retailer.website_url,
    commission: retailer.commission,
    affiliate_id: retailer.affiliate_id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Update retailer profile
      const { error: updateError } = await supabase
        .from('retailers')
        .update({
          name: formData.name,
          logo_url: formData.logo_url,
          website_url: formData.website_url,
          commission: parseFloat(formData.commission) || 0,
          affiliate_id: formData.affiliate_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retailer.id);

      if (updateError) {
        setError('Failed to update profile: ' + updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      setIsLoading(false);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-only fields */}
      <div className="bg-gray-50 p-4 rounded-md space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
          <p className="mt-1 text-sm text-gray-900">{retailer.slug}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <span className={`
            mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full
            ${retailer.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
            ${retailer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${retailer.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {retailer.status}
          </span>
        </div>
      </div>

      {/* Editable fields */}
      <Input
        label="Business Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Your Store Name"
      />

      <Input
        label="Website URL"
        type="url"
        name="website_url"
        value={formData.website_url}
        onChange={handleChange}
        required
        placeholder="https://yourstore.com"
      />

      <Input
        label="Logo URL"
        type="url"
        name="logo_url"
        value={formData.logo_url}
        onChange={handleChange}
        placeholder="https://yourstore.com/logo.png"
      />

      {formData.logo_url && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
          <img
            src={formData.logo_url}
            alt="Logo preview"
            className="h-16 w-auto object-contain border border-gray-200 rounded p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Invalid+Logo';
            }}
          />
        </div>
      )}

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

      <Input
        label="Affiliate ID (Optional)"
        type="text"
        name="affiliate_id"
        value={formData.affiliate_id}
        onChange={handleChange}
        placeholder="Your affiliate tracking ID"
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
