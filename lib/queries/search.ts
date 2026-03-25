import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  type: 'faculty' | 'department' | 'person';
  id: string;
  name: string;
  subtitle?: string;
  url: string;
  facultyId?: string;
}

async function fetchSearchResults(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

/**
 * Debounced search results.
 * Pass `enabled: q.length > 0` so the query only runs when user has typed.
 * TanStack Query caches each unique query string — repeat searches are instant.
 */
export function useSearch(q: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['search', q],
    queryFn: () => fetchSearchResults(q),
    enabled: q.trim().length > 0,
    staleTime: 30 * 1000, // cache search results for 30 s
    placeholderData: (prev) => prev,
  });
}
