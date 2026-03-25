import { useQuery } from '@tanstack/react-query';

export interface Publication {
  id: string;
  title: string;
  journal: string | null;
  year: number | null;
  doi: string | null;
  abstract: string | null;
  authors: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  type: string | null;
}

async function fetchTeacherPublications(): Promise<Publication[]> {
  const res = await fetch('/api/teacher/publications');
  if (!res.ok) throw new Error('Failed to fetch publications');
  const data = await res.json();
  return data.publications ?? [];
}

/** Logged-in faculty member's publications. */
export function useTeacherPublications() {
  return useQuery<Publication[]>({
    queryKey: ['teacher', 'publications'],
    queryFn: fetchTeacherPublications,
    staleTime: 2 * 60 * 1000,
  });
}
