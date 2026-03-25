import { useQuery } from '@tanstack/react-query';

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  designation: string;
  departmentId: string | null;
  specialization: string | null;
  experienceYears: string | null;
  qualifications: string | null;
  bio: string | null;
  profileImage: string | null;
  studentsSupervised: number;
  profileVerificationStatus: string;
  profileRejectionReason: string | null;
  department: { id: string; name: string } | null;
  studentsDetails: Array<{ name: string; email?: string; departmentId?: string }>;
}

async function fetchTeacherProfile(): Promise<TeacherProfile> {
  const res = await fetch('/api/teacher/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  const data = await res.json();
  return data.staff ?? data;
}

/** Logged-in faculty member's own profile data. */
export function useTeacherProfile() {
  return useQuery<TeacherProfile>({
    queryKey: ['teacher', 'profile'],
    queryFn: fetchTeacherProfile,
    staleTime: 3 * 60 * 1000,
  });
}
