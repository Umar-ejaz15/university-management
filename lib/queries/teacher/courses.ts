import { useQuery } from '@tanstack/react-query';

export interface Course {
  id: string;
  title: string;
  code: string | null;
  semester: string | null;
  year: number | null;
  level: string | null;
  students: number | null;
  description: string | null;
}

async function fetchTeacherCourses(): Promise<Course[]> {
  const res = await fetch('/api/teacher/courses');
  if (!res.ok) throw new Error('Failed to fetch courses');
  const data = await res.json();
  return data.courses ?? [];
}

/** Logged-in faculty member's courses. */
export function useTeacherCourses() {
  return useQuery<Course[]>({
    queryKey: ['teacher', 'courses'],
    queryFn: fetchTeacherCourses,
    staleTime: 2 * 60 * 1000,
  });
}
