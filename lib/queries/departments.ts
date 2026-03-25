import { useQuery } from '@tanstack/react-query';

export interface Department {
  id: string;
  name: string;
  facultyId: string;
  faculty: { id: string; name: string; shortName: string };
}

export interface DepartmentDetail {
  id: string;
  name: string;
  head: string;
  establishedYear: number;
  totalStudents: number;
  description: string | null;
  faculty: { id: string; name: string; shortName: string; dean: string };
  staff: Array<{
    id: string;
    name: string;
    email: string;
    designation: string;
    bio: string | null;
    experienceYears: string | null;
    profileImage: string | null;
    qualifications: string | null;
    specialization: string | null;
    studentsSupervised: number;
    totalPublications: number;
    totalProjects: number;
    totalCourses: number;
  }>;
  programs: Array<{ id: string; name: string }>;
  researchAreas: Array<{ id: string; name: string }>;
  totalStaff: number;
  totalPrograms: number;
  totalResearchAreas: number;
  totalPublications: number;
  totalProjects: number;
}

async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch('/api/departments');
  if (!res.ok) throw new Error('Failed to fetch departments');
  const data = await res.json();
  return data.departments ?? [];
}

async function fetchDepartmentDetail(facultyId: string, departmentId: string): Promise<DepartmentDetail> {
  const res = await fetch(`/api/faculties/${facultyId}/departments/${departmentId}`);
  if (!res.ok) throw new Error('Failed to fetch department');
  const data = await res.json();
  return data.department ?? data;
}

/** Shared departments list — used by faculty edit form and admin pages. */
export function useDepartments() {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 10 * 60 * 1000,
  });
}

/** Department detail page data including staff, programs, research areas. */
export function useDepartmentDetail(facultyId: string, departmentId: string) {
  return useQuery<DepartmentDetail>({
    queryKey: ['department', facultyId, departmentId],
    queryFn: () => fetchDepartmentDetail(facultyId, departmentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!facultyId && !!departmentId,
  });
}
