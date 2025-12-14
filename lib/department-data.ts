/**
 * Department and Faculty Organization Data
 * 
 * This file contains the hierarchical structure of:
 * - Faculties (e.g., Faculty of Social Sciences)
 * - Departments within each faculty
 * - Staff members in each department
 */

export interface DepartmentStaff {
  id: string;
  name: string;
  designation: string;
  email: string;
  publications: number;
  projects: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  establishedYear: number;
  totalStudents: number;
  totalStaff: number;
  programs: string[];
  description: string;
  staff: DepartmentStaff[];
  researchAreas: string[];
}

export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  totalDepartments: number;
  totalStudents: number;
  totalStaff: number;
  description: string;
  departments: Department[];
}

/**
 * All Faculties with their departments and staff
 */
export const facultiesDatabase: Faculty[] = [
  {
    id: 'social-sciences',
    name: 'Faculty of Social Sciences',
    shortName: 'FSS',
    dean: 'Prof. Dr. Maria Khan',
    establishedYear: 1985,
    totalDepartments: 4,
    totalStudents: 1250,
    totalStaff: 45,
    description: 'The Faculty of Social Sciences is dedicated to understanding human behavior, society, and social relationships through rigorous research and innovative teaching.',
    departments: [
      {
        id: 'psychology',
        name: 'Department of Psychology',
        head: 'Dr. Ahmed Raza',
        establishedYear: 1988,
        totalStudents: 320,
        totalStaff: 12,
        programs: ['BS Psychology', 'MS Clinical Psychology', 'PhD Psychology'],
        description: 'Exploring the human mind through research in cognitive, clinical, and social psychology.',
        researchAreas: ['Cognitive Psychology', 'Clinical Psychology', 'Developmental Psychology', 'Social Psychology'],
        staff: [
          {
            id: 'ahmed-raza',
            name: 'Dr. Ahmed Raza',
            designation: 'Professor & Head',
            email: 'ahmed.raza@university.edu',
            publications: 45,
            projects: 8
          },
          {
            id: 'fatima-ali',
            name: 'Dr. Fatima Ali',
            designation: 'Associate Professor',
            email: 'fatima.ali@university.edu',
            publications: 32,
            projects: 5
          },
          {
            id: 'usman-malik',
            name: 'Dr. Usman Malik',
            designation: 'Assistant Professor',
            email: 'usman.malik@university.edu',
            publications: 18,
            projects: 3
          }
        ]
      },
      {
        id: 'sociology',
        name: 'Department of Sociology',
        head: 'Dr. Zainab Hassan',
        establishedYear: 1990,
        totalStudents: 280,
        totalStaff: 10,
        programs: ['BS Sociology', 'MS Sociology', 'PhD Sociology'],
        description: 'Studying social structures, institutions, and relationships that shape our society.',
        researchAreas: ['Urban Sociology', 'Gender Studies', 'Social Stratification', 'Development Studies'],
        staff: [
          {
            id: 'zainab-hassan',
            name: 'Dr. Zainab Hassan',
            designation: 'Professor & Head',
            email: 'zainab.hassan@university.edu',
            publications: 38,
            projects: 6
          },
          {
            id: 'imran-khan',
            name: 'Dr. Imran Khan',
            designation: 'Associate Professor',
            email: 'imran.khan@university.edu',
            publications: 28,
            projects: 4
          }
        ]
      },
      {
        id: 'anthropology',
        name: 'Department of Anthropology',
        head: 'Dr. Saeed Ahmed',
        establishedYear: 1995,
        totalStudents: 180,
        totalStaff: 8,
        programs: ['BS Anthropology', 'MS Anthropology'],
        description: 'Understanding human cultures, societies, and biological aspects across time and space.',
        researchAreas: ['Cultural Anthropology', 'Archaeological Studies', 'Ethnography', 'Biological Anthropology'],
        staff: [
          {
            id: 'saeed-ahmed',
            name: 'Dr. Saeed Ahmed',
            designation: 'Associate Professor & Head',
            email: 'saeed.ahmed@university.edu',
            publications: 25,
            projects: 4
          },
          {
            id: 'ayesha-malik',
            name: 'Dr. Ayesha Malik',
            designation: 'Assistant Professor',
            email: 'ayesha.malik@university.edu',
            publications: 15,
            projects: 2
          }
        ]
      },
      {
        id: 'political-science',
        name: 'Department of Political Science',
        head: 'Dr. Hassan Mahmood',
        establishedYear: 1985,
        totalStudents: 470,
        totalStaff: 15,
        programs: ['BS Political Science', 'MS International Relations', 'PhD Political Science'],
        description: 'Analyzing political systems, governance, and international relations.',
        researchAreas: ['Comparative Politics', 'International Relations', 'Political Theory', 'Public Policy'],
        staff: [
          {
            id: 'hassan-mahmood',
            name: 'Dr. Hassan Mahmood',
            designation: 'Professor & Head',
            email: 'hassan.mahmood@university.edu',
            publications: 52,
            projects: 9
          },
          {
            id: 'sana-khan',
            name: 'Dr. Sana Khan',
            designation: 'Associate Professor',
            email: 'sana.khan@university.edu',
            publications: 34,
            projects: 6
          },
          {
            id: 'bilal-ahmed',
            name: 'Dr. Bilal Ahmed',
            designation: 'Assistant Professor',
            email: 'bilal.ahmed@university.edu',
            publications: 22,
            projects: 4
          }
        ]
      }
    ]
  },
  {
    id: 'natural-sciences',
    name: 'Faculty of Natural Sciences',
    shortName: 'FNS',
    dean: 'Prof. Dr. Ali Raza',
    establishedYear: 1978,
    totalDepartments: 5,
    totalStudents: 1800,
    totalStaff: 68,
    description: 'Advancing scientific knowledge through cutting-edge research and education in natural sciences.',
    departments: [
      {
        id: 'physics',
        name: 'Department of Physics',
        head: 'Dr. Muhammad Ali',
        establishedYear: 1978,
        totalStudents: 420,
        totalStaff: 16,
        programs: ['BS Physics', 'MS Physics', 'PhD Physics'],
        description: 'Exploring the fundamental laws of nature through theoretical and experimental physics.',
        researchAreas: ['Quantum Physics', 'Condensed Matter', 'Nuclear Physics', 'Astrophysics'],
        staff: [
          {
            id: 'muhammad-ali-physics',
            name: 'Dr. Muhammad Ali',
            designation: 'Professor & Head',
            email: 'muhammad.ali@university.edu',
            publications: 45,
            projects: 8
          }
        ]
      },
      {
        id: 'chemistry',
        name: 'Department of Chemistry',
        head: 'Dr. Nadia Iqbal',
        establishedYear: 1980,
        totalStudents: 380,
        totalStaff: 14,
        programs: ['BS Chemistry', 'MS Chemistry', 'PhD Chemistry'],
        description: 'Advancing chemical sciences through research in organic, inorganic, and analytical chemistry.',
        researchAreas: ['Organic Chemistry', 'Inorganic Chemistry', 'Analytical Chemistry', 'Physical Chemistry'],
        staff: [
          {
            id: 'nadia-iqbal',
            name: 'Dr. Nadia Iqbal',
            designation: 'Professor & Head',
            email: 'nadia.iqbal@university.edu',
            publications: 41,
            projects: 7
          }
        ]
      },
      {
        id: 'biology',
        name: 'Department of Biology',
        head: 'Dr. Amjad Hussain',
        establishedYear: 1982,
        totalStudents: 450,
        totalStaff: 15,
        programs: ['BS Biology', 'MS Biotechnology', 'PhD Biology'],
        description: 'Studying life sciences from molecular to ecosystem levels.',
        researchAreas: ['Molecular Biology', 'Genetics', 'Ecology', 'Biotechnology'],
        staff: [
          {
            id: 'amjad-hussain',
            name: 'Dr. Amjad Hussain',
            designation: 'Professor & Head',
            email: 'amjad.hussain@university.edu',
            publications: 48,
            projects: 9
          }
        ]
      },
      {
        id: 'mathematics',
        name: 'Department of Mathematics',
        head: 'Dr. Sarah Ahmed',
        establishedYear: 1979,
        totalStudents: 350,
        totalStaff: 13,
        programs: ['BS Mathematics', 'MS Mathematics', 'PhD Mathematics'],
        description: 'Exploring pure and applied mathematics through rigorous theoretical and computational approaches.',
        researchAreas: ['Pure Mathematics', 'Applied Mathematics', 'Computational Mathematics', 'Statistics'],
        staff: [
          {
            id: 'sarah-ahmed-math',
            name: 'Dr. Sarah Ahmed',
            designation: 'Associate Professor & Head',
            email: 'sarah.ahmed@university.edu',
            publications: 31,
            projects: 5
          }
        ]
      },
      {
        id: 'environmental-sciences',
        name: 'Department of Environmental Sciences',
        head: 'Dr. Kamran Shah',
        establishedYear: 2005,
        totalStudents: 200,
        totalStaff: 10,
        programs: ['BS Environmental Sciences', 'MS Environmental Management'],
        description: 'Addressing environmental challenges through interdisciplinary research and education.',
        researchAreas: ['Climate Change', 'Conservation Biology', 'Environmental Policy', 'Sustainability'],
        staff: [
          {
            id: 'kamran-shah',
            name: 'Dr. Kamran Shah',
            designation: 'Associate Professor & Head',
            email: 'kamran.shah@university.edu',
            publications: 29,
            projects: 6
          }
        ]
      }
    ]
  },
  {
    id: 'engineering',
    name: 'Faculty of Engineering',
    shortName: 'FE',
    dean: 'Prof. Dr. Khalid Mahmood',
    establishedYear: 1992,
    totalDepartments: 4,
    totalStudents: 2100,
    totalStaff: 82,
    description: 'Preparing future engineers through innovative curriculum and state-of-the-art research facilities.',
    departments: [
      {
        id: 'computer-science',
        name: 'Department of Computer Science',
        head: 'Dr. Aamir Hussain',
        establishedYear: 1995,
        totalStudents: 680,
        totalStaff: 24,
        programs: ['BS Computer Science', 'MS Computer Science', 'PhD Computer Science'],
        description: 'Leading innovation in computing through research in AI, software engineering, and cybersecurity.',
        researchAreas: ['Artificial Intelligence', 'Software Engineering', 'Cybersecurity', 'Data Science'],
        staff: [
          {
            id: 'aamir-hussain-cs',
            name: 'Dr. Aamir Hussain',
            designation: 'Assistant Professor & Head',
            email: 'aamir.hussain@university.edu',
            publications: 22,
            projects: 3
          }
        ]
      },
      {
        id: 'electrical-engineering',
        name: 'Department of Electrical Engineering',
        head: 'Dr. Tariq Jameel',
        establishedYear: 1992,
        totalStudents: 520,
        totalStaff: 20,
        programs: ['BS Electrical Engineering', 'MS Electrical Engineering', 'PhD Electrical Engineering'],
        description: 'Advancing electrical and electronic engineering through cutting-edge research.',
        researchAreas: ['Power Systems', 'Electronics', 'Telecommunications', 'Control Systems'],
        staff: [
          {
            id: 'tariq-jameel',
            name: 'Dr. Tariq Jameel',
            designation: 'Professor & Head',
            email: 'tariq.jameel@university.edu',
            publications: 55,
            projects: 11
          }
        ]
      },
      {
        id: 'mechanical-engineering',
        name: 'Department of Mechanical Engineering',
        head: 'Dr. Adnan Shah',
        establishedYear: 1993,
        totalStudents: 480,
        totalStaff: 19,
        programs: ['BS Mechanical Engineering', 'MS Mechanical Engineering'],
        description: 'Designing and innovating mechanical systems for the future.',
        researchAreas: ['Thermodynamics', 'Manufacturing', 'Robotics', 'Materials Science'],
        staff: [
          {
            id: 'adnan-shah',
            name: 'Dr. Adnan Shah',
            designation: 'Professor & Head',
            email: 'adnan.shah@university.edu',
            publications: 43,
            projects: 8
          }
        ]
      },
      {
        id: 'civil-engineering',
        name: 'Department of Civil Engineering',
        head: 'Dr. Farhan Malik',
        establishedYear: 1992,
        totalStudents: 420,
        totalStaff: 19,
        programs: ['BS Civil Engineering', 'MS Structural Engineering'],
        description: 'Building sustainable infrastructure for tomorrow.',
        researchAreas: ['Structural Engineering', 'Transportation', 'Geotechnical Engineering', 'Water Resources'],
        staff: [
          {
            id: 'farhan-malik',
            name: 'Dr. Farhan Malik',
            designation: 'Professor & Head',
            email: 'farhan.malik@university.edu',
            publications: 39,
            projects: 7
          }
        ]
      }
    ]
  }
];

/**
 * Get all faculties
 */
export function getAllFaculties() {
  return facultiesDatabase;
}

/**
 * Get a specific faculty by ID
 */
export function getFacultyById(facultyId: string) {
  return facultiesDatabase.find(f => f.id === facultyId);
}

/**
 * Get a specific department within a faculty
 */
export function getDepartmentById(facultyId: string, departmentId: string) {
  const faculty = getFacultyById(facultyId);
  if (!faculty) return undefined;
  return faculty.departments.find(d => d.id === departmentId);
}

/**
 * Get all departments across all faculties
 */
export function getAllDepartments() {
  return facultiesDatabase.flatMap(faculty => 
    faculty.departments.map(dept => ({
      ...dept,
      facultyId: faculty.id,
      facultyName: faculty.name
    }))
  );
}

/**
 * Search departments by name
 */
export function searchDepartments(query: string) {
  const allDepts = getAllDepartments();
  return allDepts.filter(dept => 
    dept.name.toLowerCase().includes(query.toLowerCase())
  );
}
