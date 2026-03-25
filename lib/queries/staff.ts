import { useQuery } from '@tanstack/react-query';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  profileImage: string | null;
  status: string;
  studentsSupervised: number;
  department: { id: string; name: string } | null;
  faculty: { id: string; name: string; shortName: string } | null;
  _count: {
    publications: number;
    projects: number;
    courses: number;
  };
}

async function fetchAllStaff(): Promise<StaffMember[]> {
  const res = await fetch('/api/staff/all');
  if (!res.ok) throw new Error('Failed to fetch staff');
  const data = await res.json();
  return data.staff ?? [];
}

/**
 * Fetches all approved faculty/staff members.
 * Used by: Staff directory page, admin views.
 */
export function useAllStaff() {
  return useQuery<StaffMember[]>({
    queryKey: ['staff', 'all'],
    queryFn: fetchAllStaff,
    staleTime: 3 * 60 * 1000,
  });
}
