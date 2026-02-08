/**
 * Deal Data Model
 * Represents a product deal with discount information
 */

export type DealStatus = 'pending' | 'approved' | 'rejected';

export interface Deal {
  // Identifiers
  id: string;

  // Product Information
  productName: string;           // Max 200 characters
  description: string;            // Max 1000 characters
  imageUrl: string;              // Supabase Storage or external URL

  // Pricing (stored in cents as integers)
  price: number;                 // e.g., 44999 = $449.99
  originalPrice: number;         // e.g., 69999 = $699.99
  savingsPercentage: number;     // Calculated: (orig-price)/orig * 100

  // Categorization
  category: string;              // Reference to category slug
  retailer: string;              // Reference to retailer slug
  retailerId?: string;           // UUID reference to retailer (for ownership)

  // Deal Metadata
  dealUrl: string;               // External retailer link
  expirationDate: Date | string; // Date or ISO string

  // Status
  isActive: boolean;             // True = visible to users
  isFeatured: boolean;           // True = show on homepage

  // Approval Workflow
  status: DealStatus;            // Pending, approved, or rejected
  approvedAt?: Date | string | null;   // When deal was approved
  approvedBy?: string | null;    // Admin user ID who approved
  rejectionReason?: string | null;     // Why deal was rejected

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;            // User ID (admin or retailer)

  // Analytics
  viewCount: number;
  clickCount: number;

  // SEO
  slug: string;                  // URL-friendly
  metaDescription?: string;
}

/**
 * Validate Deal document structure
 * @param deal - Partial deal object to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateDeal(deal: Partial<Deal>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!deal.productName) errors.push('productName is required');
  if (!deal.description) errors.push('description is required');
  if (!deal.imageUrl) errors.push('imageUrl is required');
  if (deal.price === undefined || deal.price === null) errors.push('price is required');
  if (deal.originalPrice === undefined || deal.originalPrice === null) errors.push('originalPrice is required');
  if (!deal.category) errors.push('category is required');
  if (!deal.retailer) errors.push('retailer is required');
  if (!deal.dealUrl) errors.push('dealUrl is required');
  if (!deal.expirationDate) errors.push('expirationDate is required');
  if (!deal.slug) errors.push('slug is required');

  // Field length validation
  if (deal.productName && deal.productName.length > 200) {
    errors.push('productName must be 200 characters or less');
  }
  if (deal.description && deal.description.length > 1000) {
    errors.push('description must be 1000 characters or less');
  }

  // Price validation (must be non-negative integers)
  if (deal.price !== undefined && deal.price !== null) {
    if (!Number.isInteger(deal.price)) {
      errors.push('price must be an integer (in cents)');
    }
    if (deal.price < 0) {
      errors.push('price must be non-negative');
    }
  }

  if (deal.originalPrice !== undefined && deal.originalPrice !== null) {
    if (!Number.isInteger(deal.originalPrice)) {
      errors.push('originalPrice must be an integer (in cents)');
    }
    if (deal.originalPrice < 0) {
      errors.push('originalPrice must be non-negative');
    }
  }

  // Savings percentage validation
  if (deal.savingsPercentage !== undefined && deal.savingsPercentage !== null) {
    if (deal.savingsPercentage < 0 || deal.savingsPercentage > 100) {
      errors.push('savingsPercentage must be between 0 and 100');
    }
  }

  return errors;
}

/**
 * Calculate savings percentage from original and current price
 */
export function calculateSavingsPercentage(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Format price from cents to dollar string
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Check if a deal is active and not expired
 */
export function isActiveDeal(deal: Deal): boolean {
  if (!deal.isActive) return false;
  const expirationDate = typeof deal.expirationDate === 'string' 
    ? new Date(deal.expirationDate) 
    : deal.expirationDate;
  return expirationDate.getTime() > Date.now();
}
