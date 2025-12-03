/**
 * Dashboard configuration and mock data
 * This keeps the dashboard page clean and separates data concerns
 */

export const dashboardStats = [
  {
    id: 'total-faculty',
    title: 'Total Faculty',
    value: '156'
  },
  {
    id: 'ongoing-projects',
    title: 'Ongoing Research Projects',
    value: '45'
  },
  {
    id: 'publications-year',
    title: 'Publications (This Year)',
    value: '89'
  },
  {
    id: 'students-supervised',
    title: 'Students Supervised',
    value: '342'
  }
];

export const publicationsByDepartment = {
  categories: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'],
  values: [56, 42, 67, 38, 51, 44]
};

export const researchProjectsTimeline = {
  categories: ['2020', '2021', '2022', '2023', '2024', '2025'],
  values: [12, 18, 25, 32, 38, 45]
};

export const facultyTableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'projects', label: 'Projects', align: 'center' as const },
  { key: 'publications', label: 'Publications', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'actions', label: 'Actions', align: 'center' as const },
];
