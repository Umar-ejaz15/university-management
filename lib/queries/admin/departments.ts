import { useQuery } from '@tanstack/react-query';

export interface AdminDepartment {
  id: string;
  name: string;
  head: string | null;
  establishedYear: number | null;
  totalStudents: number;
  totalPublications: number;
  totalProjects: number;
  description: string | null;
  facultyId: string;
  faculty: { id: string; name: string; shortName: string };
  _count?: { staff: number; programs: number };
}

async function fetchAdminDepartments(): Promise<AdminDepartment[]> {
  const res = await fetch('/api/admin/departments');
  if (!res.ok) throw new Error('Failed to fetch departments');
  const data = await res.json();
  return data.departments ?? [];
}

/** Admin departments list with faculty info. */
export function useAdminDepartments() {
  return useQuery<AdminDepartment[]>({
    queryKey: ['admin', 'departments'],
    queryFn: fetchAdminDepartments,
    staleTime: 5 * 60 * 1000,
  });
}
