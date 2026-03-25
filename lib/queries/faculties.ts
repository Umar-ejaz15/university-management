import { useQuery } from '@tanstack/react-query';

export interface FacultyDepartment {
  id: string;
  name: string;
  head: string;
  establishedYear: number;
  totalStudents: number;
  totalStaff: number;
  totalPublications: number;
  totalProjects: number;
  description: string | null;
}

export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  description: string | null;
  totalDepartments: number;
  totalStudents: number;
  totalStaff: number;
  totalPublications: number;
  totalProjects: number;
  departments: FacultyDepartment[];
}

async function fetchFacultiesList(): Promise<Faculty[]> {
  const res = await fetch('/api/faculties-list');
  if (!res.ok) throw new Error('Failed to fetch faculties');
  const data = await res.json();
  return data.faculties ?? [];
}

/**
 * Fetches the university faculties list.
 * Used by: Faculties page, onboarding, admin departments.
 * Cached globally — one request shared across all consuming components.
 */
export function useFacultiesList() {
  return useQuery<Faculty[]>({
    queryKey: ['faculties', 'list'],
    queryFn: fetchFacultiesList,
    staleTime: 5 * 60 * 1000, // Faculties rarely change
  });
}
