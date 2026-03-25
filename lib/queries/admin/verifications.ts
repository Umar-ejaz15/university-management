import { useQuery } from '@tanstack/react-query';

type VerifStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface StaffRef { id: string; name: string; email: string; department: { name: string } }

export interface PendingProfile {
  id: string; name: string; email: string; designation: string;
  bio: string | null; specialization: string | null; qualifications: string | null;
  experienceYears: string | null; profileImage: string | null;
  profileVerificationStatus: VerifStatus; profileRejectionReason: string | null;
  updatedAt: string; department: { name: string };
}

export interface PendingProject {
  id: string; title: string; description: string | null; status: string;
  imageUrl: string | null; verificationStatus: VerifStatus; rejectionReason: string | null;
  updatedAt: string; staff: StaffRef;
}

export interface VerifData {
  totalPending: number;
  counts: { profiles: number; projects: number };
  pendingProfiles: PendingProfile[];
  pendingProjects: PendingProject[];
}

async function fetchVerifications(): Promise<VerifData> {
  const res = await fetch('/api/admin/verifications');
  if (!res.ok) throw new Error('Failed to fetch verifications');
  return res.json();
}

/** All pending verifications (profiles + projects) for the admin review page. */
export function useAdminVerifications() {
  return useQuery<VerifData>({
    queryKey: ['admin', 'verifications'],
    queryFn: fetchVerifications,
    staleTime: 60 * 1000,
  });
}
