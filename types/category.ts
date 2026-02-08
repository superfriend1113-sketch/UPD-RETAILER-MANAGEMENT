/**
 * Category Data Model
 * Represents a classification grouping for deals
 */

export interface Category {
  // Identifiers
  id: string;

  // Category Information
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier
  description: string;           // Category description
  icon?: string;                 // Icon identifier or URL

  // Display
  order: number;                 // Display order (integer)

  // Status
  isActive: boolean;             // Whether category is active

  // Denormalized data
  dealCount: number;             // Number of deals in category (integer)

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Validate Category document structure
 * @param category - Partial category object to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCategory(category: Partial<Category>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!category.name) errors.push('name is required');
  if (!category.slug) errors.push('slug is required');
  if (!category.description) errors.push('description is required');
  if (category.order === undefined || category.order === null) errors.push('order is required');

  // Order validation (must be non-negative integer)
  if (category.order !== undefined && category.order !== null) {
    if (!Number.isInteger(category.order)) {
      errors.push('order must be an integer');
    }
    if (category.order < 0) {
      errors.push('order must be non-negative');
    }
  }

  // Deal count validation
  if (category.dealCount !== undefined && category.dealCount !== null) {
    if (!Number.isInteger(category.dealCount)) {
      errors.push('dealCount must be an integer');
    }
    if (category.dealCount < 0) {
      errors.push('dealCount must be non-negative');
    }
  }

  return errors;
}
