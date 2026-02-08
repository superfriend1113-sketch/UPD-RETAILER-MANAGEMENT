'use client';

/**
 * Deal Form Component
 * Form for creating and editing deals
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/config';
import type { Category } from '@/types/category';

interface DealFormProps {
  retailerId: string;
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    description: string;
    original_price: number;
    discounted_price: number;
    category_id: string;
    deal_url: string;
    image_url: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
  };
}

export default function DealForm({ retailerId, categories, initialData }: DealFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    original_price: initialData?.original_price?.toString() || '',
    discounted_price: initialData?.discounted_price?.toString() || '',
    category_id: initialData?.category_id || '',
    deal_url: initialData?.deal_url || '',
    image_url: initialData?.image_url || '',
    start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate prices
      const originalPrice = parseFloat(formData.original_price);
      const discountedPrice = parseFloat(formData.discounted_price);

      if (isNaN(originalPrice) || isNaN(discountedPrice)) {
        setError('Please enter valid prices');
        setIsLoading(false);
        return;
      }

      if (discountedPrice >= originalPrice) {
        setError('Discounted price must be less than original price');
        setIsLoading(false);
        return;
      }

      // Prepare deal data
      const dealData = {
        title: formData.title,
        description: formData.description,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        category_id: formData.category_id,
        retailer_id: retailerId,
        deal_url: formData.deal_url,
        image_url: formData.image_url,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        status: 'pending', // All retailer-submitted deals start as pending
      };

      if (initialData?.id) {
        // Update existing deal
        const { error: updateError } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', initialData.id)
          .eq('retailer_id', retailerId); // Ensure retailer owns this deal

        if (updateError) {
          setError('Failed to update deal: ' + updateError.message);
          setIsLoading(false);
          return;
        }

        alert('Deal updated successfully! Changes will be reviewed by admin.');
        router.push('/dashboard/deals');
      } else {
        // Create new deal
        const { error: insertError } = await supabase
          .from('deals')
          .insert(dealData);

        if (insertError) {
          setError('Failed to create deal: ' + insertError.message);
          setIsLoading(false);
          return;
        }

        alert('Deal submitted successfully! It will be reviewed by our team.');
        router.push('/dashboard/deals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const discountPercentage = formData.original_price && formData.discounted_price
    ? Math.round(((parseFloat(formData.original_price) - parseFloat(formData.discounted_price)) / parseFloat(formData.original_price)) * 100)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Deal Title"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="e.g., 50% Off Premium Headphones"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the deal, what's included, and why it's a great offer..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Original Price ($)"
            type="number"
            name="original_price"
            value={formData.original_price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="99.99"
          />
        </div>
        <div>
          <Input
            label="Discounted Price ($)"
            type="number"
            name="discounted_price"
            value={formData.discounted_price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="49.99"
          />
          {discountPercentage > 0 && (
            <p className="mt-1 text-sm text-green-600 font-medium">
              {discountPercentage}% off
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Deal URL"
        type="url"
        name="deal_url"
        value={formData.deal_url}
        onChange={handleChange}
        required
        placeholder="https://yourstore.com/products/deal"
      />

      <Input
        label="Image URL"
        type="url"
        name="image_url"
        value={formData.image_url}
        onChange={handleChange}
        required
        placeholder="https://yourstore.com/images/product.jpg"
      />

      {formData.image_url && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
          <img
            src={formData.image_url}
            alt="Deal preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
        />
        <Input
          label="End Date (Optional)"
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          min={formData.start_date}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active (deal can be shown once approved)
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : initialData ? 'Update Deal' : 'Submit Deal'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
