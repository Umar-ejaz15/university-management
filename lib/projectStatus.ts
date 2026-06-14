export type ProjectStatus = 'SUBMITTED' | 'ONGOING' | 'COMPLETED' | 'PENDING';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  SUBMITTED: 'Submitted',
  ONGOING:   'Ongoing',
  COMPLETED: 'Completed',
  PENDING:   'Pending',
};

/** Tailwind badge classes — matches dashboard pie chart colours */
export const STATUS_BADGE: Record<ProjectStatus, string> = {
  SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200',
  ONGOING:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING:   'bg-orange-50 text-orange-700 border-orange-200',
};

/** Filled dot colour for status indicators */
export const STATUS_DOT: Record<ProjectStatus, string> = {
  SUBMITTED: 'bg-amber-500',
  ONGOING:   'bg-emerald-500',
  COMPLETED: 'bg-blue-500',
  PENDING:   'bg-orange-500',
};

/** Hex colours for charts — keep in sync with STATUS_CHART_COLORS order */
export const STATUS_COLOR: Record<ProjectStatus, string> = {
  SUBMITTED: '#c9a961',
  ONGOING:   '#2d6a4f',
  COMPLETED: '#1976d2',
  PENDING:   '#e65100',
};

export const STATUS_ORDER: ProjectStatus[] = ['SUBMITTED', 'ONGOING', 'COMPLETED', 'PENDING'];

/** Flat colour array for pie/bar charts — same order as STATUS_ORDER */
export const STATUS_CHART_COLORS = STATUS_ORDER.map((s) => STATUS_COLOR[s]);

export function statusLabel(s: string): string {
  return STATUS_LABEL[s as ProjectStatus] ?? s;
}

export function statusBadge(s: string): string {
  return STATUS_BADGE[s as ProjectStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

export function statusDot(s: string): string {
  return STATUS_DOT[s as ProjectStatus] ?? 'bg-gray-400';
}
