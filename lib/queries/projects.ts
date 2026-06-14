import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface ProjectStaff {
  id: string;
  name: string;
  designation: string;
  profileImage: string | null;
  department: { id: string; name: string };
}

export type ProjectKind = 'RESEARCH' | 'INDUSTRY';
export type ProjectScope = 'NATIONAL' | 'INTERNATIONAL';
export type ProjectLifecycle = 'SUBMITTED' | 'ONGOING' | 'COMPLETED' | 'PENDING';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectLifecycle;
  projectKind: ProjectKind;
  scope: ProjectScope;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  studentCount: number;
  fundingAgency: string | null;
  fundingAmount: string | null;
  budgetAmount: string | null;
  currency: string | null;
  collaborators: string | null;
  funderType: string | null;
  thematicArea: string | null;
  financialYear: string | null;
  sponsoringAgency: string | null;
  projectType: string | null;
  staff: ProjectStaff;
}

export interface Department {
  id: string;
  name: string;
}

interface ProjectsResponse {
  projects: Project[];
  departments: Department[];
}

async function fetchVerifiedProjects(): Promise<ProjectsResponse> {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

/**
 * Fetches all admin-verified projects with their departments.
 * Cached for 2 minutes — navigating back to the projects page is instant.
 */
export function useProjects() {
  return useQuery<ProjectsResponse>({
    queryKey: ['projects', 'verified'],
    queryFn: fetchVerifiedProjects,
    staleTime: 2 * 60 * 1000,
    // Show cached data while refetching in background
    placeholderData: (prev) => prev,
  });
}

/**
 * Returns a function to force-refresh the projects list (e.g. after submission).
 */
export function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['projects', 'verified'] });
}
