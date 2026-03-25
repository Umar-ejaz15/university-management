import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  staffId?: string;
}

export interface StaffStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  rejectionReason: string | null;
}

export interface AuthMeResponse {
  user: AuthUser;
  staff: StaffStatus | null;
}

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  return res.json();
}

/**
 * Full /api/auth/me response: user + staff status.
 * Cached globally — all components share one request.
 * Used by: pending-approval (needs staff status), Header, CLS, any protected page.
 */
export function useAuthMe() {
  return useQuery<AuthMeResponse | null>({
    queryKey: ['auth', 'me'],
    queryFn: fetchAuthMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Convenience hook — returns only the user object.
 * Same cache key as useAuthMe, so zero extra requests.
 */
export function useCurrentUser() {
  const { data, isLoading, error } = useAuthMe();
  return { data: data?.user ?? null, isLoading, error };
}

/**
 * Returns a logout function that clears the server session
 * AND wipes the entire TanStack Query cache.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  return async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    queryClient.clear();
  };
}
