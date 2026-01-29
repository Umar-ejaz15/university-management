import { JWTPayload } from './auth';
import { createAuditLog } from './audit';

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  user?: JWTPayload;
}

/**
 * Require admin role for the current user
 * Logs unauthorized access attempts
 */
export async function requireAdmin(
  user: JWTPayload | null,
  requestUrl?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthorizationResult> {
  if (!user) {
    return {
      authorized: false,
      reason: 'Not authenticated',
    };
  }

  if (user.role !== 'ADMIN') {
    // Log unauthorized access attempt
    await createAuditLog({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      performedBy: user.userId,
      targetType: 'API',
      targetId: requestUrl || 'unknown',
      metadata: {
        attemptedRole: user.role,
        requiredRole: 'ADMIN',
      },
      ipAddress,
      userAgent,
    });

    return {
      authorized: false,
      reason: 'Forbidden: Admin access required',
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Check if user has one of the allowed roles
 */
export async function requireRole(
  user: JWTPayload | null,
  allowedRoles: string[]
): Promise<AuthorizationResult> {
  if (!user) {
    return {
      authorized: false,
      reason: 'Not authenticated',
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      reason: `Forbidden: One of [${allowedRoles.join(', ')}] roles required`,
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Check if user can access a staff profile
 * Admins can access all profiles, faculty can only access their own
 */
export async function canAccessStaffProfile(
  user: JWTPayload | null,
  staffId: string,
  userStaffId?: string | null
): Promise<boolean> {
  if (!user) return false;

  // Admins can access all profiles
  if (user.role === 'ADMIN') return true;

  // Faculty can only access their own profile
  if (user.role === 'FACULTY' && userStaffId === staffId) return true;

  return false;
}

/**
 * Check if accessing own profile
 */
export async function isOwnProfile(
  user: JWTPayload | null,
  staffId: string,
  userStaffId?: string | null
): Promise<boolean> {
  if (!user || !userStaffId) return false;
  return userStaffId === staffId;
}
