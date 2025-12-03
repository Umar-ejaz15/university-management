// Mock faculty database - in production this would come from a real database
export const facultyDatabase = [
  {
    id: 'aamir-hussain',
    name: 'Dr. Aamir Hussain',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    publications: 22,
    projects: 3,
    students: 12,
    publicationsHistory: {
      years: ['2020', '2021', '2022', '2023', '2024', '2025'],
      values: [2, 3, 4, 5, 4, 4]
    },
    teachingLoad: [
      { course: 'AI Fundamentals', credits: '3', students: '45' },
      { course: 'Data Structures', credits: '4', students: '60' },
    ]
  },
  {
    id: 'sarah-ahmed',
    name: 'Dr. Sarah Ahmed',
    designation: 'Associate Professor',
    department: 'Mathematics',
    publications: 31,
    projects: 5,
    students: 18,
    publicationsHistory: {
      years: ['2020', '2021', '2022', '2023', '2024', '2025'],
      values: [3, 5, 6, 7, 5, 5]
    },
    teachingLoad: [
      { course: 'Linear Algebra', credits: '4', students: '55' },
      { course: 'Calculus II', credits: '4', students: '48' },
    ]
  },
  {
    id: 'muhammad-ali',
    name: 'Dr. Muhammad Ali',
    designation: 'Professor',
    department: 'Physics',
    publications: 45,
    projects: 8,
    students: 25,
    publicationsHistory: {
      years: ['2020', '2021', '2022', '2023', '2024', '2025'],
      values: [6, 8, 9, 8, 7, 7]
    },
    teachingLoad: [
      { course: 'Quantum Mechanics', credits: '4', students: '35' },
      { course: 'Thermodynamics', credits: '3', students: '42' },
    ]
  },
];

export function getFacultyById(id: string) {
  return facultyDatabase.find(faculty => faculty.id === id);
}

export function getAllFaculty() {
  return facultyDatabase;
}
