import { useQuery } from '@tanstack/react-query';

export interface AdminStats {
  totalFaculty: number;
  pendingCount: number;
  rejectedCount: number;
  totalDepartments: number;
  pendingVerifications?: number;
}

export interface PendingFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: { name: string; faculty: string };
  specialization: string | null;
  experienceYears: string | null;
  createdAt: string;
}

async function fetchAdminStats(): Promise<AdminStats> {
  const [statsRes, verifRes] = await Promise.all([
    fetch('/api/admin/stats'),
    fetch('/api/admin/verifications'),
  ]);
  const stats = statsRes.ok ? await statsRes.json() : {};
  const verif  = verifRes.ok  ? await verifRes.json()  : {};
  return { ...stats, pendingVerifications: verif.totalPending ?? 0 };
}

async function fetchPendingFaculty(): Promise<PendingFaculty[]> {
  const res = await fetch('/api/admin/pending-faculty');
  if (!res.ok) throw new Error('Failed to fetch pending faculty');
  const data = await res.json();
  return data.faculty ?? [];
}

/** Admin dashboard aggregated stats (faculty counts + pending verifications). */
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    staleTime: 60 * 1000,
  });
}

/** List of faculty members awaiting approval. */
export function usePendingFaculty() {
  return useQuery<PendingFaculty[]>({
    queryKey: ['admin', 'pending-faculty'],
    queryFn: fetchPendingFaculty,
    staleTime: 60 * 1000,
  });
}
