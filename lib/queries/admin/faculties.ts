import { useQuery } from '@tanstack/react-query';

export interface AdminFaculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  description: string | null;
  totalPublications: number;
  totalProjects: number;
  _count: { departments: number };
}

async function fetchAdminFaculties(): Promise<AdminFaculty[]> {
  const res = await fetch('/api/admin/faculties');
  if (!res.ok) throw new Error('Failed to fetch faculties');
  const data = await res.json();
  return data.faculties ?? [];
}

/**
 * Admin faculties list.
 * Shared between admin/faculties page AND admin/departments page
 * (departments need the faculty list for the faculty dropdown).
 */
export function useAdminFaculties() {
  return useQuery<AdminFaculty[]>({
    queryKey: ['admin', 'faculties'],
    queryFn: fetchAdminFaculties,
    staleTime: 5 * 60 * 1000,
  });
}
