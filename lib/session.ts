import { cookies } from 'next/headers';
import { prisma } from './db';
import { verifyToken, type JWTPayload } from './auth';

// Short-lived in-memory cache so role changes / deactivations take effect
// within ~30s instead of waiting for JWT expiry (7 days). Per-instance only;
// acceptable for single-instance deploys — upgrade to Redis for multi-instance.
interface CachedUser {
  payload: JWTPayload;
  expiresAt: number;
}
const userCache = new Map<string, CachedUser>();
const USER_CACHE_TTL = 30_000; // 30 seconds

/**
 * Get the current user from cookies, re-validating against the database.
 *
 * Returns null when unauthenticated, the token is invalid, or the account has
 * been deactivated (`isActive = false`). The returned role is always the
 * fresh DB value, so role changes take effect within USER_CACHE_TTL.
 *
 * Node runtime only — do NOT use this in middleware/Edge (it touches Prisma).
 * For Edge, use `verifyToken` from `lib/auth` directly.
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const now = Date.now();
  const cached = userCache.get(payload.userId);
  if (cached && cached.expiresAt > now) {
    return cached.payload;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!dbUser || !dbUser.isActive) {
    userCache.delete(payload.userId);
    return null;
  }

  const fresh: JWTPayload = {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    name: dbUser.name,
  };
  userCache.set(payload.userId, { payload: fresh, expiresAt: now + USER_CACHE_TTL });
  return fresh;
}

/**
 * Invalidate the cached session for a user. Call this immediately after
 * deactivating a user or changing their role so the change takes effect
 * without waiting for the TTL to expire.
 */
export function invalidateUser(userId: string): void {
  userCache.delete(userId);
}
