import ActionButtons from '@/components/ui/ActionButtons';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * Sample faculty data for the dashboard table
 * In production, this would be fetched from an API or database
 */
export const facultyTableData = [
  {
    name: 'Dr. Aamir Hussain',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    projects: '3',
    publications: '22',
    status: <StatusBadge status="approved" />,
    actions: <ActionButtons viewHref="/faculty/aamir-hussain" />
  },
  {
    name: 'Dr. Sarah Ahmed',
    department: 'Mathematics',
    designation: 'Associate Professor',
    projects: '5',
    publications: '31',
    status: <StatusBadge status="approved" />,
    actions: <ActionButtons viewHref="/faculty/sarah-ahmed" />
  },
  {
    name: 'Dr. Muhammad Ali',
    department: 'Physics',
    designation: 'Professor',
    projects: '8',
    publications: '45',
    status: <StatusBadge status="approved" />,
    actions: <ActionButtons viewHref="/faculty/muhammad-ali" />
  },
  {
    name: 'Dr. Fatima Khan',
    department: 'Chemistry',
    designation: 'Assistant Professor',
    projects: '4',
    publications: '18',
    status: <StatusBadge status="approved" />,
    actions: <ActionButtons />
  },
  {
    name: 'Dr. Ahmed Raza',
    department: 'Computer Science',
    designation: 'Lecturer',
    projects: '2',
    publications: '12',
    status: <StatusBadge status="approved" />,
    actions: <ActionButtons />
  },
  {
    name: 'Dr. Zainab Malik',
    department: 'Biology',
    designation: 'Associate Professor',
    projects: '6',
    publications: '28',
    status: <StatusBadge status="approved" />,
    actions: <ActionButtons />
  },
];
