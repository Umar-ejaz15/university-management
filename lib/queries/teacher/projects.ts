import { useQuery } from '@tanstack/react-query';

export interface TeacherProject {
  id: string;
  title: string;
  description: string | null;
  objectives: string | null;
  methodology: string | null;
  outcomes: string | null;
  status: 'ONGOING' | 'COMPLETED' | 'PENDING';
  startDate: string | null;
  endDate: string | null;
  studentCount: number;
  fundingAgency: string | null;
  fundingAmount: string | null;
  collaborators: string | null;
  projectUrl: string | null;
  imageUrl: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
}

async function fetchTeacherProjects(): Promise<TeacherProject[]> {
  const res = await fetch('/api/teacher/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.projects ?? [];
}

/** Logged-in faculty member's own projects (all statuses). */
export function useTeacherProjects() {
  return useQuery<TeacherProject[]>({
    queryKey: ['teacher', 'projects'],
    queryFn: fetchTeacherProjects,
    staleTime: 2 * 60 * 1000,
  });
}
