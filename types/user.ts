/**
 * User Profile and Role Data Models
 * Manages user roles and permissions across the platform
 */

export type UserRole = 'admin' | 'retailer' | 'consumer';

export interface UserProfile {
  // Identifiers
  id: string;                    // Links to auth.users.id
  email: string;

  // Role & Permissions
  role: UserRole;                // User's role in the system

  // Retailer Linking (for retailer role)
  retailerId?: string | null;    // UUID of linked retailer account

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Type guard to check if user is an admin
 * @param profile - User profile to check
 * @returns True if user is an admin
 */
export function isAdmin(profile: UserProfile | null | undefined): boolean {
  return profile?.role === 'admin';
}

/**
 * Type guard to check if user is a retailer
 * @param profile - User profile to check
 * @returns True if user is a retailer
 */
export function isRetailer(profile: UserProfile | null | undefined): boolean {
  return profile?.role === 'retailer';
}

/**
 * Type guard to check if user is a consumer
 * @param profile - User profile to check
 * @returns True if user is a consumer
 */
export function isConsumer(profile: UserProfile | null | undefined): boolean {
  return profile?.role === 'consumer';
}

/**
 * Get display name for a role
 * @param role - User role
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    retailer: 'Retailer',
    consumer: 'Consumer',
  };
  return roleNames[role];
}

/**
 * Check if a role has specific permission
 * @param role - User role to check
 * @param permission - Permission to verify
 * @returns True if role has the permission
 */
export function hasPermission(
  role: UserRole,
  permission: 'manage_deals' | 'manage_categories' | 'manage_retailers' | 'approve_content' | 'view_analytics'
): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['manage_deals', 'manage_categories', 'manage_retailers', 'approve_content', 'view_analytics'],
    retailer: ['manage_deals', 'view_analytics'], // Retailers can only manage their own deals
    consumer: [],
  };

  return permissions[role]?.includes(permission) ?? false;
}

/**
 * Validate user profile structure
 * @param profile - Partial user profile to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUserProfile(profile: Partial<UserProfile>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!profile.email) errors.push('email is required');
  if (!profile.role) errors.push('role is required');

  // Email validation
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push('email must be a valid email address');
  }

  // Role validation
  if (profile.role && !['admin', 'retailer', 'consumer'].includes(profile.role)) {
    errors.push('role must be admin, retailer, or consumer');
  }

  // Retailer linking validation
  if (profile.role === 'retailer' && !profile.retailerId) {
    errors.push('retailerId is required for retailer role');
  }

  return errors;
}
