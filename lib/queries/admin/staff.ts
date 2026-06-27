import { useQuery } from '@tanstack/react-query';

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  specialization: string | null;
  experienceYears: string | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  profileVerificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  departmentId: string;
  department: { id: string; name: string; faculty: { id: string; name: string; shortName: string } };
  _count: {
    publications: number;
    projects: number;
    courses: number;
    consultancies: number;
    patents: number;
    mous: number;
    events: number;
    industrialVisits: number;
    policyAdvocacies: number;
    ipDisclosures: number;
    ipLicensings: number;
    equipmentRequests: number;
  };
}

async function fetchAdminStaff(): Promise<AdminStaffMember[]> {
  const res = await fetch('/api/admin/staff');
  if (!res.ok) throw new Error('Failed to fetch staff');
  const data = await res.json();
  return data.staff ?? [];
}

export function useAdminStaff() {
  return useQuery<AdminStaffMember[]>({
    queryKey: ['admin', 'staff'],
    queryFn: fetchAdminStaff,
    staleTime: 2 * 60 * 1000,
  });
}
