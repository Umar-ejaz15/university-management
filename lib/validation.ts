export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate faculty/staff ID format
 * Should be a valid cuid
 */
export function validateFacultyId(id: string): ValidationResult {
  const errors: string[] = [];

  if (!id || typeof id !== 'string') {
    errors.push('Faculty ID is required');
    return { valid: false, errors };
  }

  if (id.trim().length === 0) {
    errors.push('Faculty ID cannot be empty');
  }

  // Basic cuid validation (starts with 'c', 25 chars)
  // cuid can contain both uppercase and lowercase letters
  if (!id.match(/^c[a-zA-Z0-9]{24}$/)) {
    errors.push('Invalid faculty ID format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate rejection reason
 * Must be at least 20 characters
 */
export function validateRejectionReason(reason: string): ValidationResult {
  const errors: string[] = [];

  if (!reason || typeof reason !== 'string') {
    errors.push('Rejection reason is required');
    return { valid: false, errors };
  }

  const trimmed = reason.trim();

  if (trimmed.length === 0) {
    errors.push('Rejection reason cannot be empty');
  } else if (trimmed.length < 20) {
    errors.push('Rejection reason must be at least 20 characters');
  } else if (trimmed.length > 500) {
    errors.push('Rejection reason must not exceed 500 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(
  page: number,
  limit: number
): ValidationResult {
  const errors: string[] = [];

  if (typeof page !== 'number' || page < 1) {
    errors.push('Page must be a positive number');
  }

  if (typeof limit !== 'number' || limit < 1) {
    errors.push('Limit must be a positive number');
  }

  if (limit > 100) {
    errors.push('Limit cannot exceed 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): ValidationResult {
  const errors: string[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    errors.push('Invalid start date format');
  }

  if (isNaN(end.getTime())) {
    errors.push('Invalid end date format');
  }

  if (errors.length === 0 && start > end) {
    errors.push('Start date must be before end date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate audit log action filter
 */
export function validateAuditAction(action: string): ValidationResult {
  const errors: string[] = [];

  const validActions = [
    'APPROVE_FACULTY',
    'REJECT_FACULTY',
    'REAPPLY_FACULTY',
    'UNAUTHORIZED_ACCESS_ATTEMPT',
    'CHANGE_USER_ROLE',
    'DEACTIVATE_USER',
  ];

  if (action && !validActions.includes(action)) {
    errors.push(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>\"']/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[char] || char;
    });
}
