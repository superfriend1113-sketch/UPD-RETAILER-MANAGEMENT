/**
 * Retailer Data Model
 * Represents a merchant or store that offers deals
 */

export type RetailerStatus = 'pending' | 'approved' | 'rejected';

export interface Retailer {
  // Identifiers
  id: string;

  // Retailer Information
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier
  logoUrl: string;               // Supabase Storage URL for logo
  websiteUrl: string;            // Retailer website
  affiliateId?: string;          // Affiliate tracking ID

  // Status
  isActive: boolean;             // Whether retailer is active

  // Denormalized data
  dealCount: number;             // Number of deals from retailer (integer)

  // Business
  commission: string;            // Commission rate or structure

  // User Account Linking & Approval
  userId?: string | null;        // Linked auth.users ID
  status: RetailerStatus;        // Pending, approved, or rejected
  approvedAt?: Date | string | null;   // When retailer was approved
  approvedBy?: string | null;    // Admin user ID who approved
  rejectionReason?: string | null;     // Why retailer was rejected

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Check if a user can manage this retailer
 * @param retailer - Retailer to check
 * @param userId - User ID attempting access
 * @param userRole - Role of the user
 * @returns True if user can manage retailer
 */
export function canManageRetailer(
  retailer: Retailer,
  userId: string,
  userRole: 'admin' | 'retailer' | 'consumer'
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'retailer' && retailer.userId === userId) return true;
  return false;
}

/**
 * Validate Retailer document structure
 * @param retailer - Partial retailer object to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRetailer(retailer: Partial<Retailer>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!retailer.name) errors.push('name is required');
  if (!retailer.slug) errors.push('slug is required');
  if (!retailer.logoUrl) errors.push('logoUrl is required');
  if (!retailer.websiteUrl) errors.push('websiteUrl is required');
  if (!retailer.commission) errors.push('commission is required');

  // URL validation
  if (retailer.websiteUrl) {
    try {
      new URL(retailer.websiteUrl);
    } catch {
      errors.push('websiteUrl must be a valid URL');
    }
  }

  // Deal count validation
  if (retailer.dealCount !== undefined && retailer.dealCount !== null) {
    if (!Number.isInteger(retailer.dealCount)) {
      errors.push('dealCount must be an integer');
    }
    if (retailer.dealCount < 0) {
      errors.push('dealCount must be non-negative');
    }
  }

  return errors;
}
