import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hashPassword } from '../lib/auth';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // =================================================================
  // CREATE ADMIN & SPECIAL ACCOUNTS
  // =================================================================

  const ADMIN_EMAIL = 'admin@mnsuam.edu.pk';
  const ADMIN_PASSWORD = 'Admin@2024!Secure';
  const ADMIN_NAME = 'System Administrator';

  console.log('\n📋 Creating admin account...');

  const hashedAdminPassword = await hashPassword(ADMIN_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      name: ADMIN_NAME,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin account created!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  // =================================================================
  // CREATE FACULTIES (UPDATED MAPPING)
  // =================================================================

  console.log('\n🏛️  Creating faculties...');

  // Faculties and their departments as per user mapping
  const facultiesData = [
    {
      name: 'Faculty of Agricultural Bio System Engineering & Technology',
      shortName: 'FABSET',
      dean: 'Prof. Dr. Adeel Akram',
      establishedYear: 2000,
      description: 'Focuses on agricultural engineering and technology.',
      departments: [
        { 
          name: 'Department of Agricultural Engineering', 
          head: 'Dr. Imran Raza', 
          establishedYear: 2000, 
          totalStudents: 200, 
          description: 'Agricultural engineering and mechanization.',
          programs: ['BS Agricultural Engineering', 'MS Agricultural Engineering', 'PhD Agricultural Engineering']
        },
      ],
    },
    {
      name: 'Faculty of Agriculture & Environmental Science',
      shortName: 'FAES',
      dean: 'Prof. Dr. Nida Akhtar',
      establishedYear: 1995,
      description: 'Covers plant breeding, biotechnology, and environmental sciences.',
      departments: [
        { 
          name: 'Institute of Plant Breeding and Biotechnology', 
          head: 'Dr. Sara Malik', 
          establishedYear: 2005, 
          totalStudents: 180, 
          description: 'Plant breeding and biotechnology.',
          programs: ['BS Plant Breeding & Genetics', 'MS Plant Breeding & Genetics', 'PhD Plant Breeding & Genetics', 'MS Biotechnology']
        },
        { 
          name: 'Institute of Plant Protection (IPP)', 
          head: 'Dr. Khalid Javed', 
          establishedYear: 2007, 
          totalStudents: 120, 
          description: 'Plant protection and pest management.',
          programs: ['BS Plant Protection', 'MS Entomology', 'MS Plant Pathology', 'PhD Entomology']
        },
        { 
          name: 'Department of Agronomy', 
          head: 'Dr. Ahsan Ali', 
          establishedYear: 1996, 
          totalStudents: 160, 
          description: 'Agronomy and crop production.',
          programs: ['BS Agronomy', 'MS Agronomy', 'PhD Agronomy']
        },
        { 
          name: 'Department of Horticulture', 
          head: 'Dr. Sadaf Iqbal', 
          establishedYear: 1998, 
          totalStudents: 140, 
          description: 'Horticulture and fruit science.',
          programs: ['BS Horticulture', 'MS Horticulture', 'PhD Horticulture']
        },
        { 
          name: 'Department of Soil and Environmental Sciences', 
          head: 'Dr. Nazia Bibi', 
          establishedYear: 2002, 
          totalStudents: 110, 
          description: 'Soil and environmental sciences.',
          programs: ['BS Soil Science', 'BS Environmental Sciences', 'MS Soil Science', 'MS Environmental Sciences', 'PhD Soil Science']
        },
      ],
    },
    {
      name: 'Faculty of Social Science & Humanities',
      shortName: 'FSSH',
      dean: 'Prof. Dr. Sadia Malik',
      establishedYear: 2003,
      description: 'Social sciences and humanities.',
      departments: [], // No departments listed
    },
    {
      name: 'Faculty of Food and Home Sciences',
      shortName: 'FFHS',
      dean: 'Prof. Dr. Rabia Nawaz',
      establishedYear: 2004,
      description: 'Food, nutrition, and home sciences.',
      departments: [
        { 
          name: 'Department of Agricultural and Resource Economics', 
          head: 'Dr. Usman Farooq', 
          establishedYear: 2004, 
          totalStudents: 90, 
          description: 'Agricultural economics and resource management.',
          programs: ['BS Agricultural Economics', 'MS Agricultural Economics', 'PhD Agricultural Economics']
        },
        { 
          name: 'Department of Agribusiness and Entrepreneurship Development', 
          head: 'Dr. Imran Ahmed', 
          establishedYear: 2006, 
          totalStudents: 80, 
          description: 'Agribusiness and entrepreneurship.',
          programs: ['BS Agribusiness Management', 'MS Agribusiness Management']
        },
        { 
          name: 'Department of Mathematics and Statistics', 
          head: 'Dr. Samina Akhtar', 
          establishedYear: 2005, 
          totalStudents: 100, 
          description: 'Mathematics and statistics.',
          programs: ['BS Mathematics', 'BS Statistics', 'MS Mathematics', 'MS Statistics', 'PhD Statistics']
        },
        { 
          name: 'Department of Outreach and Continuing Education', 
          head: 'Dr. Khalid Mehmood', 
          establishedYear: 2007, 
          totalStudents: 60, 
          description: 'Outreach and continuing education.',
          programs: ['Certificate Programs', 'Diploma Programs']
        },
      ],
    },
    {
      name: 'Faculty of Veterinary and Animal Science',
      shortName: 'FVAS',
      dean: 'Prof. Dr. Tariq Mahmood',
      establishedYear: 2008,
      description: 'Veterinary and animal sciences.',
      departments: [
        { 
          name: 'Department of Food Science and Technology', 
          head: 'Dr. Hina Ashraf', 
          establishedYear: 2008, 
          totalStudents: 70, 
          description: 'Food science and technology.',
          programs: ['BS Food Science & Technology', 'MS Food Science & Technology', 'PhD Food Science & Technology']
        },
        { 
          name: 'Department Of Human Nutrition and Dietetics', 
          head: 'Dr. Fatima Zahra', 
          establishedYear: 2010, 
          totalStudents: 60, 
          description: 'Human nutrition and dietetics.',
          programs: ['BS Human Nutrition & Dietetics', 'MS Human Nutrition & Dietetics']
        },
        { 
          name: 'Department of Home Sciences', 
          head: 'Dr. Sana Ullah', 
          establishedYear: 2011, 
          totalStudents: 50, 
          description: 'Home sciences.',
          programs: ['BS Home Sciences', 'MS Home Sciences']
        },
      ],
    },
    {
      name: 'Institute of Computing',
      shortName: 'IOC',
      dean: 'Prof. Dr. Bilal Asghar',
      establishedYear: 2012,
      description: 'Computing and information technology.',
      departments: [], // No departments listed
    },
    {
      name: 'Central Library',
      shortName: 'CL',
      dean: 'Chief Librarian',
      establishedYear: 2010,
      description: 'Central library and information services.',
      departments: [], // No departments listed
    },
  ];

  // Create faculties and departments
  const facultyMap: Record<string, Awaited<ReturnType<typeof prisma.faculty.upsert>>> = {};
  for (const faculty of facultiesData) {
    const createdFaculty = await prisma.faculty.upsert({
      where: { shortName: faculty.shortName },
      update: {},
      create: {
        name: faculty.name,
        shortName: faculty.shortName,
        dean: faculty.dean,
        establishedYear: faculty.establishedYear,
        description: faculty.description,
      },
    });
    facultyMap[faculty.shortName] = createdFaculty;
    if (faculty.departments.length > 0) {
      for (const dept of faculty.departments) {
        const createdDepartment = await prisma.department.create({
          data: {
            name: dept.name,
            head: dept.head,
            establishedYear: dept.establishedYear,
            totalStudents: dept.totalStudents,
            description: dept.description,
            facultyId: createdFaculty.id,
          },
        });

        // Add programs for the department if any
        if (dept.programs && dept.programs.length > 0) {
          for (const programName of dept.programs) {
            await prisma.program.create({
              data: {
                name: programName,
                departmentId: createdDepartment.id,
              },
            });
          }
        }
      }
    } else {
      console.log(`⚠️  Faculty "${faculty.name}" has no departments. Department onboarding will be skipped for this faculty.`);
    }
  }

  console.log(`✅ ${facultiesData.length} faculties created (with departments as mapped)`);

  // ...departments are now created with faculties above...

  // =================================================================
  // CREATE STAFF MEMBERS WITH DETAILED PROFILES
  // =================================================================

  console.log('\n👥 Creating staff members with publications and projects...');

  // Helper function to create staff with publications and projects
  async function createStaffMember(data: {
    name: string;
    email: string;
    password: string;
    designation: string;
    departmentId: string;
    bio: string;
    experienceYears: string;
    qualifications: string;
    specialization: string;
    administrativeDuties?: string;
    studentsSupervised: number;
    publications: Array<{
      title: string;
      authors: string;
      year: number;
      publicationType: 'JOURNAL_ARTICLE' | 'CONFERENCE_PAPER' | 'BOOK' | 'BOOK_CHAPTER' | 'THESIS' | 'PATENT' | 'TECHNICAL_REPORT' | 'WORKING_PAPER' | 'PREPRINT';
      journal?: string;
      volume?: string;
      pages?: string;
      doi?: string;
      abstract?: string;
      citationCount: number;
    }>;
    projects: Array<{
      title: string;
      description: string;
      status: 'ONGOING' | 'COMPLETED' | 'PENDING';
      studentCount: number;
      startDate: Date;
      endDate?: Date;
    }>;
    courses: Array<{
      name: string;
      credits: number;
      students: number;
    }>;
  }) {
    const hashedPassword = await hashPassword(data.password);

    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        email: data.email,
        designation: data.designation,
        departmentId: data.departmentId,
        bio: data.bio,
        experienceYears: data.experienceYears,
        qualifications: data.qualifications,
        specialization: data.specialization,
        administrativeDuties: data.administrativeDuties,
        studentsSupervised: data.studentsSupervised,
        status: 'APPROVED',
      },
    });

    // Create user account
    await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'FACULTY',
        staffId: staff.id,
        isActive: true,
      },
    });

    // Create publications
    for (const pub of data.publications) {
      await prisma.publication.create({
        data: {
          ...pub,
          staffId: staff.id,
        },
      });
    }

    // Create projects
    for (const proj of data.projects) {
      await prisma.project.create({
        data: {
          ...proj,
          staffId: staff.id,
        },
      });
    }

    // Create courses
    for (const course of data.courses) {
      await prisma.course.create({
        data: {
          ...course,
          staffId: staff.id,
        },
      });
    }

    return staff;
  }

  // =================================================================
  // COMPUTER SCIENCE DEPARTMENT STAFF (Including Dr. Ramsah)
  // =================================================================

  // Helper to get departmentId by department name and faculty shortName
  async function getDepartmentId(departmentName: string, facultyShortName: string) {
    const faculty = await prisma.faculty.findUnique({ where: { shortName: facultyShortName } });
    if (!faculty) throw new Error(`Faculty with shortName ${facultyShortName} not found`);
    const dept = await prisma.department.findFirst({ where: { name: departmentName, facultyId: faculty.id } });
    if (!dept) throw new Error(`Department ${departmentName} not found in faculty ${facultyShortName}`);
    return dept.id;
  }

  // Example: update all createStaffMember calls to use dynamic departmentId
  await createStaffMember({
    name: 'Maam Ramsha Ahmad',
    email: 'ramsaha.ahmad@mnsuam.edu.pk',
    password: 'Ramsah@2024',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Agricultural Engineering', 'FABSET'),
    bio: 'Dr. Ramsah Qasim is a distinguished professor with over 18 years of experience in computer science education and research. She specializes in database systems, data mining, and machine learning algorithms. Her research has been published in numerous prestigious international journals and conferences. She has supervised 45+ MS and PhD students and is actively involved in curriculum development and accreditation activities.',
    experienceYears: '18',
    qualifications: 'PhD in Computer Science (University of Engineering & Technology, Lahore), MS Computer Science (FAST-NUCES), BS Computer Science',
    specialization: 'Database Systems, Data Mining, Machine Learning, Information Retrieval',
    administrativeDuties: '- Head of Department\n- Chairperson, Board of Studies\n- Member, Academic Council\n- Coordinator, HEC Quality Assurance\n- Lead, Research Ethics Committee',
    studentsSupervised: 45,
    publications: [
      // ...existing code...
    ],
    projects: [
      // ...existing code...
    ],
    courses: [
      // ...existing code...
    ],
  });
  // Repeat for all other createStaffMember calls, updating departmentId accordingly

  await createStaffMember({
    name: 'Dr. Asad Ali',
    email: 'asad.ali@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Associate Professor',
    departmentId: await getDepartmentId('Department of Agricultural Engineering', 'FABSET'),
    bio: 'Dr. Asad Ali has 14 years of teaching and research experience in algorithms, complexity theory, and computational mathematics. He has published over 35 research papers in high-impact journals and has received multiple research grants from HEC and international funding agencies.',
    experienceYears: '14',
    qualifications: 'PhD Computer Science (NED University), MS Computer Science (FAST), BS Computer Science',
    specialization: 'Algorithms, Computational Complexity, Graph Theory, Optimization',
    administrativeDuties: '- Coordinator, Graduate Programs\n- Member, Examination Committee\n- Faculty Advisor',
    studentsSupervised: 28,
    publications: [
      {
        title: 'Polynomial-Time Algorithms for NP-Hard Graph Problems',
        authors: 'Asad Ali, R. Khan, S. Hussain',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Journal of Algorithms and Computation',
        volume: '48',
        pages: '234-256',
        doi: '10.1016/j.jalc.2023.05.012',
        abstract: 'Novel polynomial-time approximation algorithms for specific NP-hard graph coloring and vertex cover problems with theoretical guarantees.',
        citationCount: 19,
      },
      {
        title: 'Distributed Computing Algorithms for Large-Scale Networks',
        authors: 'Asad Ali, M. Akram',
        year: 2022,
        publicationType: 'CONFERENCE_PAPER',
        journal: 'ACM Symposium on Parallel Algorithms and Architectures',
        pages: '67-78',
        citationCount: 24,
      },
    ],
    projects: [
      {
        title: 'Efficient Algorithms for Network Optimization',
        description: 'Research on developing efficient algorithms for telecommunications network optimization and routing.',
        status: 'ONGOING',
        studentCount: 4,
        startDate: new Date('2022-09-01'),
      },
    ],
    courses: [
      { name: 'Design and Analysis of Algorithms', credits: 4, students: 92 },
      { name: 'Theory of Computation', credits: 3, students: 68 },
      { name: 'Discrete Mathematics', credits: 3, students: 105 },
    ],
  });

  await createStaffMember({
    name: 'Dr. Fatima Zahra',
    email: 'fatima.zahra@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Assistant Professor',
    departmentId: await getDepartmentId('Department of Agricultural Engineering', 'FABSET'),
    bio: 'Dr. Fatima Zahra is a young and dynamic researcher specializing in computer networks, IoT, and wireless sensor networks. She completed her PhD with distinction and has established a state-of-the-art networking research lab. Her work focuses on energy-efficient protocols for IoT devices.',
    experienceYears: '8',
    qualifications: 'PhD Computer Networks (COMSATS University), MS Computer Science, BS Computer Engineering',
    specialization: 'Computer Networks, IoT, Wireless Sensor Networks, Network Security',
    administrativeDuties: '- Lab Coordinator, Networking Lab\n- Member, Student Affairs Committee',
    studentsSupervised: 12,
    publications: [
      {
        title: 'Energy-Efficient Routing Protocols for IoT Agricultural Monitoring',
        authors: 'Fatima Zahra, A. Qasim, N. Bibi',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'IEEE Internet of Things Journal',
        volume: '10',
        pages: '8234-8247',
        doi: '10.1109/JIOT.2023.3245678',
        abstract: 'Novel energy-efficient routing protocol designed specifically for agricultural IoT applications, extending network lifetime by 45%.',
        citationCount: 15,
      },
      {
        title: 'Security Challenges in Wireless Sensor Networks for Smart Agriculture',
        authors: 'Fatima Zahra, K. Shah, S. Ahmed',
        year: 2022,
        publicationType: 'CONFERENCE_PAPER',
        journal: 'International Conference on IoT and Smart Agriculture',
        pages: '112-119',
        citationCount: 22,
      },
    ],
    projects: [
      {
        title: 'Smart Agriculture Monitoring using IoT',
        description: 'Deployment of wireless sensor network for real-time monitoring of soil moisture, temperature, and crop health in agricultural fields.',
        status: 'ONGOING',
        studentCount: 6,
        startDate: new Date('2023-03-01'),
      },
    ],
    courses: [
      { name: 'Computer Networks', credits: 4, students: 88 },
      { name: 'Wireless and Mobile Networks', credits: 3, students: 45 },
      { name: 'Internet of Things', credits: 3, students: 52 },
    ],
  });

  await createStaffMember({
    name: 'Dr. Hamza Naveed',
    email: 'hamza.naveed@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Assistant Professor',
    departmentId: await getDepartmentId('Department of Agricultural Engineering', 'FABSET'),
    bio: 'Dr. Hamza Naveed specializes in operating systems, distributed systems, and cloud computing. He has industry experience from leading tech companies and brings practical insights to his teaching. His research focuses on container orchestration and microservices architecture.',
    experienceYears: '10',
    qualifications: 'PhD Distributed Systems (University of Management & Technology), MS Computer Science, BS Software Engineering',
    specialization: 'Operating Systems, Distributed Systems, Cloud Computing, Virtualization',
    studentsSupervised: 16,
    publications: [
      {
        title: 'Container Orchestration Strategies for Microservices Architecture',
        authors: 'Hamza Naveed, B. Asghar, Z. Malik',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Journal of Cloud Computing',
        volume: '12',
        pages: '45-67',
        doi: '10.1186/s13677-023-00412-8',
        citationCount: 11,
      },
    ],
    projects: [
      {
        title: 'Containerized University LMS Deployment',
        description: 'Migration of university learning management system to containerized microservices architecture using Kubernetes.',
        status: 'ONGOING',
        studentCount: 5,
        startDate: new Date('2023-08-01'),
      },
    ],
    courses: [
      { name: 'Operating Systems', credits: 4, students: 96 },
      { name: 'Distributed Systems', credits: 3, students: 41 },
      { name: 'Cloud Computing', credits: 3, students: 58 },
    ],
  });

  // =================================================================
  // SOFTWARE ENGINEERING DEPARTMENT STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Bilal Asghar',
    email: 'bilal.asghar@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Agricultural and Resource Economics', 'FFHS'),
    bio: 'Dr. Bilal Asghar is an accomplished software engineering professional with 16 years in academia and industry. He has led major software development projects and brings extensive experience in agile methodologies, software architecture, and quality assurance. He has trained hundreds of software engineers who now work in leading tech companies worldwide.',
    experienceYears: '16',
    qualifications: 'PhD Software Engineering (NUST), MS Software Engineering (FAST), BS Computer Science',
    specialization: 'Software Architecture, Agile Development, DevOps, Software Quality Assurance',
    administrativeDuties: '- Head of Department\n- Director, Software House\n- Industry Liaison Coordinator',
    studentsSupervised: 38,
    publications: [
      {
        title: 'Microservices Architecture Patterns for Enterprise Applications',
        authors: 'Bilal Asghar, H. Naveed, R. Qasim',
        year: 2023,
        publicationType: 'BOOK_CHAPTER',
        journal: 'Advanced Software Engineering Practices - Springer International',
        pages: '145-178',
        doi: '10.1007/978-3-031-12345-6_8',
        citationCount: 34,
      },
      {
        title: 'DevOps Implementation Framework for Academic Institutions',
        authors: 'Bilal Asghar, U. Farooq',
        year: 2022,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Journal of Software Engineering and Applications',
        volume: '15',
        pages: '289-312',
        citationCount: 27,
      },
    ],
    projects: [
      {
        title: 'University ERP System Development',
        description: 'Complete enterprise resource planning system for university administration including student management, HR, and finance modules.',
        status: 'ONGOING',
        studentCount: 12,
        startDate: new Date('2022-01-15'),
      },
      {
        title: 'Automated Testing Framework for Web Applications',
        description: 'Comprehensive automated testing solution for continuous integration and deployment pipelines.',
        status: 'COMPLETED',
        studentCount: 8,
        startDate: new Date('2020-09-01'),
        endDate: new Date('2022-06-30'),
      },
    ],
    courses: [
      { name: 'Software Engineering', credits: 4, students: 112 },
      { name: 'Software Architecture and Design', credits: 3, students: 67 },
      { name: 'Agile Software Development', credits: 3, students: 54 },
    ],
  });

  await createStaffMember({
    name: 'Dr. Sana Ullah',
    email: 'sana.ullah@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Associate Professor',
    departmentId: await getDepartmentId('Department of Home Sciences', 'FVAS'),
    bio: 'Dr. Sana Ullah is a software quality expert with extensive research in software testing, verification, and validation. She has developed innovative testing methodologies that are being used by several software companies in Pakistan. Her work focuses on improving software reliability and reducing defects.',
    experienceYears: '13',
    qualifications: 'PhD Software Engineering (University of Lahore), MS Software Engineering, BS Computer Science',
    specialization: 'Software Testing, Quality Assurance, Formal Methods, Software Metrics',
    studentsSupervised: 24,
    publications: [
      {
        title: 'Mutation Testing Strategies for Object-Oriented Programs',
        authors: 'Sana Ullah, B. Asghar, A. Ali',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Software Testing, Verification and Reliability',
        volume: '33',
        pages: '156-178',
        doi: '10.1002/stvr.1834',
        citationCount: 18,
      },
    ],
    projects: [
      {
        title: 'Automated Test Case Generation Tool',
        description: 'AI-powered tool for automatic generation of test cases from software specifications and code.',
        status: 'ONGOING',
        studentCount: 5,
        startDate: new Date('2023-02-01'),
      },
    ],
    courses: [
      { name: 'Software Testing and Quality Assurance', credits: 3, students: 78 },
      { name: 'Software Verification and Validation', credits: 3, students: 42 },
      { name: 'Software Project Management', credits: 3, students: 65 },
    ],
  });

  // =================================================================
  // ARTIFICIAL INTELLIGENCE DEPARTMENT STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Zainab Malik',
    email: 'zainab.malik@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Institute of Plant Breeding and Biotechnology', 'FAES'),
    bio: 'Dr. Zainab Malik is a leading AI researcher in Pakistan with 15 years of experience in machine learning, deep learning, and computer vision. She has secured multiple international research grants and collaborates with top AI labs worldwide. Her work on medical image analysis has been published in Nature and Science.',
    experienceYears: '15',
    qualifications: 'PhD Artificial Intelligence (MIT, USA), MS Computer Science (Stanford), BS Computer Science',
    specialization: 'Machine Learning, Deep Learning, Computer Vision, Medical Image Analysis',
    administrativeDuties: '- Head of Department\n- Director, AI Research Center\n- Member, National AI Advisory Board',
    studentsSupervised: 42,
    publications: [
      {
        title: 'Deep Learning for Automated Diagnosis of Diabetic Retinopathy',
        authors: 'Zainab Malik, H. Ashraf, M. Riaz',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Nature Medicine',
        volume: '29',
        pages: '1234-1245',
        doi: '10.1038/s41591-023-02345-6',
        abstract: 'State-of-the-art deep learning model for detecting diabetic retinopathy from retinal images with 96.7% accuracy, surpassing human expert performance.',
        citationCount: 156,
      },
      {
        title: 'Transfer Learning for Low-Resource Medical Image Classification',
        authors: 'Zainab Malik, F. Zahra, S. Akhtar',
        year: 2022,
        publicationType: 'CONFERENCE_PAPER',
        journal: 'International Conference on Medical Image Computing (MICCAI)',
        pages: '234-245',
        doi: '10.1007/978-3-031-16431-6_23',
        citationCount: 89,
      },
      {
        title: 'Explainable AI for Healthcare Decision Support Systems',
        authors: 'Zainab Malik, R. Qasim, H. Ashraf',
        year: 2021,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Artificial Intelligence in Medicine',
        volume: '118',
        pages: '102-118',
        citationCount: 124,
      },
    ],
    projects: [
      {
        title: 'AI-Powered Disease Diagnosis System',
        description: 'Development of multi-disease diagnosis system using deep learning for rural healthcare centers with limited medical expertise.',
        status: 'ONGOING',
        studentCount: 10,
        startDate: new Date('2022-06-01'),
      },
      {
        title: 'Crop Disease Detection using Computer Vision',
        description: 'Mobile app for farmers to detect crop diseases by capturing images, using convolutional neural networks.',
        status: 'COMPLETED',
        studentCount: 8,
        startDate: new Date('2020-03-01'),
        endDate: new Date('2022-12-31'),
      },
    ],
    courses: [
      { name: 'Artificial Intelligence', credits: 4, students: 95 },
      { name: 'Deep Learning', credits: 3, students: 58 },
      { name: 'Computer Vision', credits: 3, students: 46 },
      { name: 'Medical Image Analysis', credits: 3, students: 32 },
    ],
  });

  await createStaffMember({
    name: 'Dr. Usman Ahmed',
    email: 'usman.ahmed@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Associate Professor',
    departmentId: await getDepartmentId('Institute of Plant Breeding and Biotechnology', 'FAES'),
    bio: 'Dr. Usman Ahmed specializes in natural language processing and has developed several language models for Urdu and regional Pakistani languages. His research bridges AI and linguistics, making technology more accessible for non-English speakers. He has published extensively on low-resource language processing.',
    experienceYears: '11',
    qualifications: 'PhD Natural Language Processing (University of Edinburgh, UK), MS Computational Linguistics, BS Computer Science',
    specialization: 'Natural Language Processing, Machine Translation, Sentiment Analysis, Urdu NLP',
    studentsSupervised: 22,
    publications: [
      {
        title: 'Neural Machine Translation for Low-Resource Pakistani Languages',
        authors: 'Usman Ahmed, Z. Malik, R. Qasim',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Computational Linguistics',
        volume: '49',
        pages: '567-592',
        doi: '10.1162/coli_a_00478',
        citationCount: 43,
      },
      {
        title: 'Sentiment Analysis for Urdu Social Media Text',
        authors: 'Usman Ahmed, S. Malik',
        year: 2022,
        publicationType: 'CONFERENCE_PAPER',
        journal: 'Annual Meeting of the Association for Computational Linguistics',
        pages: '1234-1245',
        citationCount: 37,
      },
    ],
    projects: [
      {
        title: 'Urdu Language Understanding System',
        description: 'Comprehensive NLP toolkit for Urdu language including POS tagging, named entity recognition, and semantic analysis.',
        status: 'ONGOING',
        studentCount: 7,
        startDate: new Date('2022-09-01'),
      },
    ],
    courses: [
      { name: 'Natural Language Processing', credits: 3, students: 52 },
      { name: 'Machine Learning', credits: 4, students: 87 },
      { name: 'Text Mining and Analytics', credits: 3, students: 44 },
    ],
  });

  // =================================================================
  // CYBER SECURITY DEPARTMENT STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Kamran Shah',
    email: 'kamran.shah@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Associate Professor & Head of Department',
    departmentId: await getDepartmentId('Institute of Plant Protection (IPP)', 'FAES'),
    bio: 'Dr. Kamran Shah is a certified ethical hacker and cybersecurity expert with 12 years of experience in information security. He has worked as a security consultant for major banks and government organizations. His research focuses on network security, cryptography, and penetration testing.',
    experienceYears: '12',
    qualifications: 'PhD Cyber Security (NUST), MS Information Security, BS Computer Science, CEH, CISSP',
    specialization: 'Network Security, Cryptography, Penetration Testing, Incident Response',
    administrativeDuties: '- Head of Department\n- Director, Cyber Security Lab\n- Security Advisor to University',
    studentsSupervised: 20,
    publications: [
      {
        title: 'Advanced Persistent Threat Detection using Machine Learning',
        authors: 'Kamran Shah, F. Zahra, Z. Malik',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'IEEE Transactions on Information Forensics and Security',
        volume: '18',
        pages: '3456-3470',
        doi: '10.1109/TIFS.2023.3245678',
        citationCount: 32,
      },
      {
        title: 'Blockchain-Based Security Framework for IoT Devices',
        authors: 'Kamran Shah, F. Zahra',
        year: 2022,
        publicationType: 'CONFERENCE_PAPER',
        journal: 'IEEE Symposium on Security and Privacy',
        pages: '234-248',
        citationCount: 45,
      },
    ],
    projects: [
      {
        title: 'University Network Security Assessment',
        description: 'Comprehensive security audit and penetration testing of university IT infrastructure with remediation recommendations.',
        status: 'COMPLETED',
        studentCount: 6,
        startDate: new Date('2022-03-01'),
        endDate: new Date('2023-02-28'),
      },
      {
        title: 'Intrusion Detection System Development',
        description: 'AI-based intrusion detection system for real-time monitoring and threat prevention.',
        status: 'ONGOING',
        studentCount: 5,
        startDate: new Date('2023-01-15'),
      },
    ],
    courses: [
      { name: 'Network Security', credits: 3, students: 64 },
      { name: 'Ethical Hacking and Penetration Testing', credits: 3, students: 58 },
      { name: 'Cryptography and Network Security', credits: 4, students: 72 },
    ],
  });

  // =================================================================
  // ELECTRICAL ENGINEERING DEPARTMENT STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Tariq Mahmood',
    email: 'tariq.mahmood@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Food Science and Technology', 'FVAS'),
    bio: 'Dr. Tariq Mahmood is a distinguished electrical engineer with expertise in power systems, renewable energy, and smart grids. He has 20 years of experience and has completed numerous projects for WAPDA and NTDC. His research on solar power optimization has contributed significantly to Pakistan\'s renewable energy goals.',
    experienceYears: '20',
    qualifications: 'PhD Electrical Engineering (UET Lahore), MS Power Systems, BS Electrical Engineering, PE License',
    specialization: 'Power Systems, Renewable Energy, Smart Grids, Power Electronics',
    administrativeDuties: '- Head of Department\n- Chairperson, Board of Studies\n- Coordinator, WAPDA Collaboration Projects',
    studentsSupervised: 52,
    publications: [
      {
        title: 'Optimal Placement of Solar Panels for Maximum Energy Harvesting in Pakistan',
        authors: 'Tariq Mahmood, A. Iqbal, S. Hussain',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Renewable Energy',
        volume: '201',
        pages: '567-582',
        doi: '10.1016/j.renene.2023.01.045',
        citationCount: 38,
      },
      {
        title: 'Smart Grid Implementation Strategies for Developing Countries',
        authors: 'Tariq Mahmood, H. Raza',
        year: 2022,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'IEEE Transactions on Smart Grid',
        volume: '13',
        pages: '2345-2358',
        citationCount: 56,
      },
    ],
    projects: [
      {
        title: 'University Solar Power Plant Design',
        description: '1 MW solar power plant design and implementation for university campus with smart monitoring system.',
        status: 'ONGOING',
        studentCount: 8,
        startDate: new Date('2023-01-01'),
      },
      {
        title: 'Power Quality Analysis for Industrial Sector',
        description: 'Comprehensive power quality assessment and improvement solutions for local industries.',
        status: 'COMPLETED',
        studentCount: 6,
        startDate: new Date('2021-06-01'),
        endDate: new Date('2023-05-31'),
      },
    ],
    courses: [
      { name: 'Power Systems Analysis', credits: 4, students: 78 },
      { name: 'Renewable Energy Systems', credits: 3, students: 62 },
      { name: 'Smart Grid Technologies', credits: 3, students: 45 },
    ],
  });

  // =================================================================
  // AGRICULTURE DEPARTMENTS STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Abdul Qadir',
    email: 'abdul.qadir@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Agronomy', 'FAES'),
    bio: 'Dr. Abdul Qadir is a renowned agronomist with 22 years of experience in crop breeding, genetics, and sustainable agriculture. He has developed several high-yielding wheat and rice varieties that are now grown across Punjab. His work has significantly contributed to food security in Pakistan.',
    experienceYears: '22',
    qualifications: 'PhD Crop Science (University of Agriculture Faisalabad), MS Agronomy, BS Agriculture',
    specialization: 'Plant Breeding, Crop Genetics, Sustainable Agriculture, Seed Technology',
    administrativeDuties: '- Head of Department\n- Director, Crop Research Station\n- Member, Punjab Seed Council',
    studentsSupervised: 65,
    publications: [
      {
        title: 'Development of Drought-Tolerant Wheat Varieties for Climate Resilience',
        authors: 'Abdul Qadir, N. Bibi, S. Ahmed',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Field Crops Research',
        volume: '289',
        pages: '108-125',
        doi: '10.1016/j.fcr.2023.108234',
        citationCount: 47,
      },
      {
        title: 'Genetic Improvement of Rice for Salt Tolerance in Coastal Areas',
        authors: 'Abdul Qadir, M. Akram',
        year: 2022,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Crop Science',
        volume: '62',
        pages: '1234-1248',
        citationCount: 52,
      },
    ],
    projects: [
      {
        title: 'Climate-Smart Wheat Breeding Program',
        description: 'Development of climate-resilient wheat varieties through marker-assisted selection and genomic approaches.',
        status: 'ONGOING',
        studentCount: 12,
        startDate: new Date('2021-01-01'),
      },
    ],
    courses: [
      { name: 'Crop Production Technology', credits: 4, students: 95 },
      { name: 'Plant Breeding and Genetics', credits: 3, students: 68 },
      { name: 'Seed Science and Technology', credits: 3, students: 52 },
    ],
  });

  await createStaffMember({
    name: 'Dr. Nazia Bibi',
    email: 'nazia.bibi@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Associate Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Soil and Environmental Sciences', 'FAES'),
    bio: 'Dr. Nazia Bibi is a soil scientist specializing in soil fertility, nutrient management, and environmental sustainability. Her research on organic farming and soil health has helped thousands of farmers improve their crop yields while protecting the environment.',
    experienceYears: '15',
    qualifications: 'PhD Soil Science (University of Agriculture Faisalabad), MS Soil Chemistry, BS Soil Science',
    specialization: 'Soil Fertility, Nutrient Management, Organic Farming, Soil Conservation',
    studentsSupervised: 38,
    publications: [
      {
        title: 'Biochar Application for Soil Health Improvement in Degraded Agricultural Lands',
        authors: 'Nazia Bibi, A. Qadir, F. Zahra',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Soil Biology and Biochemistry',
        volume: '178',
        pages: '108-123',
        doi: '10.1016/j.soilbio.2023.108945',
        citationCount: 42,
      },
    ],
    projects: [
      {
        title: 'Soil Health Monitoring using IoT Sensors',
        description: 'Real-time soil parameter monitoring system for precision agriculture using wireless sensor networks.',
        status: 'ONGOING',
        studentCount: 8,
        startDate: new Date('2022-08-01'),
      },
    ],
    courses: [
      { name: 'Soil Fertility and Plant Nutrition', credits: 4, students: 72 },
      { name: 'Organic Agriculture', credits: 3, students: 58 },
      { name: 'Environmental Soil Science', credits: 3, students: 45 },
    ],
  });

  // =================================================================
  // PSYCHOLOGY DEPARTMENT STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Hina Ashraf',
    email: 'hina.ashraf@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Home Sciences', 'FVAS'),
    bio: 'Dr. Hina Ashraf is a clinical psychologist with 18 years of experience in mental health research and therapy. She has established a counseling center at the university providing free services to students. Her research on depression and anxiety in Pakistani youth has informed national mental health policies.',
    experienceYears: '18',
    qualifications: 'PhD Clinical Psychology (Quaid-i-Azam University), MS Psychology, BS Psychology, Licensed Clinical Psychologist',
    specialization: 'Clinical Psychology, Cognitive Behavioral Therapy, Mental Health, Counseling',
    administrativeDuties: '- Head of Department\n- Director, Student Counseling Center\n- Member, Mental Health Advisory Board',
    studentsSupervised: 42,
    publications: [
      {
        title: 'Prevalence of Depression and Anxiety in Pakistani University Students',
        authors: 'Hina Ashraf, S. Malik, Z. Malik',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Journal of Affective Disorders',
        volume: '325',
        pages: '234-245',
        doi: '10.1016/j.jad.2023.01.056',
        citationCount: 67,
      },
      {
        title: 'Effectiveness of Online Cognitive Behavioral Therapy in Pakistan',
        authors: 'Hina Ashraf, K. Mehmood',
        year: 2022,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Internet Interventions',
        volume: '28',
        pages: '100-115',
        citationCount: 54,
      },
    ],
    projects: [
      {
        title: 'University Mental Health Screening Program',
        description: 'Comprehensive mental health screening and early intervention program for all university students.',
        status: 'ONGOING',
        studentCount: 10,
        startDate: new Date('2022-09-01'),
      },
    ],
    courses: [
      { name: 'Clinical Psychology', credits: 4, students: 65 },
      { name: 'Cognitive Behavioral Therapy', credits: 3, students: 42 },
      { name: 'Abnormal Psychology', credits: 3, students: 78 },
      { name: 'Counseling Techniques', credits: 3, students: 52 },
    ],
  });

  // =================================================================
  // BUSINESS ADMINISTRATION STAFF
  // =================================================================

  await createStaffMember({
    name: 'Dr. Usman Farooq',
    email: 'usman.farooq@mnsuam.edu.pk',
    password: 'Faculty@123',
    designation: 'Professor & Head of Department',
    departmentId: await getDepartmentId('Department of Agribusiness and Entrepreneurship Development', 'FFHS'),
    bio: 'Dr. Usman Farooq is a management expert with 17 years of experience in business strategy, entrepreneurship, and organizational behavior. He has consulted for numerous multinational companies and startups. His research on entrepreneurial ecosystems in Pakistan has been widely cited.',
    experienceYears: '17',
    qualifications: 'PhD Management Sciences (LUMS), MBA Finance, BBA, PMP Certified',
    specialization: 'Strategic Management, Entrepreneurship, Organizational Behavior, Leadership',
    administrativeDuties: '- Head of Department\n- Director, Entrepreneurship Center\n- Member, Board of Governors',
    studentsSupervised: 48,
    publications: [
      {
        title: 'Entrepreneurial Ecosystem Development in Emerging Markets',
        authors: 'Usman Farooq, I. Ahmed, R. Nawaz',
        year: 2023,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Journal of Business Venturing',
        volume: '38',
        pages: '106-128',
        doi: '10.1016/j.jbusvent.2023.106234',
        citationCount: 73,
      },
      {
        title: 'Digital Transformation and Business Model Innovation in SMEs',
        authors: 'Usman Farooq, B. Asghar',
        year: 2022,
        publicationType: 'JOURNAL_ARTICLE',
        journal: 'Technological Forecasting and Social Change',
        volume: '175',
        pages: '121-138',
        citationCount: 61,
      },
    ],
    projects: [
      {
        title: 'University Business Incubation Center',
        description: 'Establishment of business incubation facility to support student and faculty startups.',
        status: 'ONGOING',
        studentCount: 15,
        startDate: new Date('2022-01-01'),
      },
    ],
    courses: [
      { name: 'Strategic Management', credits: 3, students: 95 },
      { name: 'Entrepreneurship and Innovation', credits: 3, students: 88 },
      { name: 'Organizational Behavior', credits: 3, students: 102 },
      { name: 'Business Leadership', credits: 2, students: 65 },
    ],
  });

  console.log('✅ All staff members created with detailed profiles');

  // =================================================================
  // SUMMARY
  // =================================================================

  console.log('\n✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 6 Faculties');
  console.log('   - 17 Departments');
  console.log('   - 20+ Faculty Members with detailed profiles');
  console.log('   - 100+ Publications');
  console.log('   - 50+ Research Projects');
  console.log('   - 150+ Courses');

  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('\n👨‍💼 ADMIN ACCOUNT:');
  console.log('   Email: admin@mnsuam.edu.pk');
  console.log('   Password: Admin@2024!Secure');
  console.log('   Role: Administrator');

  console.log('\n👩‍🏫 DR. RAMSAH QASIM ACCOUNT (Head of CS):');
  console.log('   Email: ramsah.qasim@mnsuam.edu.pk');
  console.log('   Password: Ramsah@2024');
  console.log('   Role: Faculty');
  console.log('   Department: Computer Science');

  console.log('\n💡 Other Faculty Accounts (all have password: Faculty@123):');
  console.log('   - asad.ali@mnsuam.edu.pk (CS)');
  console.log('   - fatima.zahra@mnsuam.edu.pk (CS - Networks)');
  console.log('   - hamza.naveed@mnsuam.edu.pk (CS - Systems)');
  console.log('   - bilal.asghar@mnsuam.edu.pk (Software Engineering)');
  console.log('   - zainab.malik@mnsuam.edu.pk (AI)');
  console.log('   - usman.ahmed@mnsuam.edu.pk (AI - NLP)');
  console.log('   - kamran.shah@mnsuam.edu.pk (Cyber Security)');
  console.log('   - tariq.mahmood@mnsuam.edu.pk (Electrical Engineering)');
  console.log('   - abdul.qadir@mnsuam.edu.pk (Crop Science)');
  console.log('   - nazia.bibi@mnsuam.edu.pk (Soil Science)');
  console.log('   - hina.ashraf@mnsuam.edu.pk (Psychology)');
  console.log('   - usman.farooq@mnsuam.edu.pk (Business Administration)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
