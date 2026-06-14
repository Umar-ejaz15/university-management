import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hashPassword } from '../lib/auth';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('🌱 Seeding MNSUAM database...');

  // ── Admin & ORIC accounts ────────────────────────────────────────────────
  const pw = await hashPassword('Admin@2024!Secure');

  await prisma.user.upsert({
    where: { email: 'admin@mnsuam.edu.pk' },
    update: {},
    create: { email: 'admin@mnsuam.edu.pk', password: pw, name: 'System Administrator', role: 'ADMIN', isActive: true },
  });

  await prisma.user.upsert({
    where: { email: 'oric@mnsuam.edu.pk' },
    update: {},
    create: { email: 'oric@mnsuam.edu.pk', password: pw, name: 'ORIC Administrator', role: 'ORIC', isActive: true },
  });

  // ── Faculties ────────────────────────────────────────────────────────────
  const faes = await prisma.faculty.upsert({
    where: { shortName: 'FAES' },
    update: {},
    create: { name: 'Faculty of Agriculture & Environmental Science', shortName: 'FAES', dean: 'Prof. Dr. Nida Akhtar', establishedYear: 1995, description: 'Covers plant breeding, biotechnology, agronomy, horticulture, and environmental sciences.' },
  });
  const fabset = await prisma.faculty.upsert({
    where: { shortName: 'FABSET' },
    update: {},
    create: { name: 'Faculty of Agricultural Bio System Engineering & Technology', shortName: 'FABSET', dean: 'Prof. Dr. Adeel Akram', establishedYear: 2000, description: 'Agricultural engineering and technology.' },
  });
  const ffhs = await prisma.faculty.upsert({
    where: { shortName: 'FFHS' },
    update: {},
    create: { name: 'Faculty of Food and Home Sciences', shortName: 'FFHS', dean: 'Prof. Dr. Rabia Nawaz', establishedYear: 2004, description: 'Food, nutrition, and home sciences.' },
  });
  const fvas = await prisma.faculty.upsert({
    where: { shortName: 'FVAS' },
    update: {},
    create: { name: 'Faculty of Veterinary and Animal Science', shortName: 'FVAS', dean: 'Prof. Dr. Tariq Mehmood', establishedYear: 2008, description: 'Veterinary and animal sciences.' },
  });
  const ioc = await prisma.faculty.upsert({
    where: { shortName: 'IOC' },
    update: {},
    create: { name: 'Institute of Computing', shortName: 'IOC', dean: 'Prof. Dr. Bilal Asghar', establishedYear: 2012, description: 'Computing and information technology.' },
  });

  // ── Departments ──────────────────────────────────────────────────────────
  const mkDept = async (name: string, head: string, yr: number, students: number, facultyId: string, programs: string[]) => {
    let dept = await prisma.department.findFirst({ where: { name, facultyId } });
    if (!dept) {
      dept = await prisma.department.create({ data: { name, head, establishedYear: yr, totalStudents: students, facultyId } });
    }
    for (const pName of programs) {
      const ex = await prisma.program.findFirst({ where: { name: pName, departmentId: dept.id } });
      if (!ex) await prisma.program.create({ data: { name: pName, departmentId: dept.id } });
    }
    return dept;
  };

  const dAgronomy    = await mkDept('Department of Agronomy', 'Dr. Abdul Qadir', 1996, 160, faes.id, ['BS Agronomy', 'MS Agronomy', 'PhD Agronomy']);
  const dIPBB        = await mkDept('Institute of Plant Breeding and Biotechnology', 'Dr. Zainab Malik', 2005, 180, faes.id, ['BS Plant Breeding & Genetics', 'MS Biotechnology', 'PhD Plant Breeding']);
  const dIPP         = await mkDept('Institute of Plant Protection (IPP)', 'Dr. Kamran Shah', 2007, 120, faes.id, ['BS Plant Protection', 'MS Entomology', 'PhD Entomology']);
  const dSoil        = await mkDept('Department of Soil and Environmental Sciences', 'Dr. Nazia Bibi', 2002, 110, faes.id, ['BS Soil Science', 'MS Soil Science', 'PhD Soil Science']);
  const dHort        = await mkDept('Department of Horticulture', 'Dr. Sadaf Iqbal', 1998, 140, faes.id, ['BS Horticulture', 'MS Horticulture']);
  const dAgrEng      = await mkDept('Department of Agricultural Engineering', 'Dr. Imran Raza', 2000, 200, fabset.id, ['BS Agricultural Engineering', 'MS Agricultural Engineering']);
  const dFoodSci     = await mkDept('Department of Food Science and Technology', 'Dr. Hina Ashraf', 2008, 70, ffhs.id, ['BS Food Science & Technology', 'MS Food Science & Technology']);
  const dNutrition   = await mkDept('Department of Human Nutrition and Dietetics', 'Dr. Fatima Zahra', 2010, 60, ffhs.id, ['BS Human Nutrition & Dietetics', 'MS Human Nutrition']);
  const dAgrEcon     = await mkDept('Department of Agricultural and Resource Economics', 'Dr. Usman Farooq', 2004, 90, ffhs.id, ['BS Agricultural Economics', 'MS Agricultural Economics']);
  const dMathStat    = await mkDept('Department of Mathematics and Statistics', 'Dr. Samina Akhtar', 2005, 100, ffhs.id, ['BS Mathematics', 'BS Statistics', 'MS Statistics']);
  const dCS          = await mkDept('Department of Computer Science', 'Dr. Asad Ali', 2012, 250, ioc.id, ['BS Computer Science', 'MS Computer Science', 'PhD Computer Science']);
  const dVetSci      = await mkDept('Department of Veterinary Sciences', 'Dr. Tariq Mahmood', 2008, 150, fvas.id, ['DVM', 'MS Veterinary Pathology']);

  // ── Helper: create staff + user + publications + courses ─────────────────
  const mkStaff = async (d: {
    name: string; email: string; password: string; designation: string; deptId: string;
    bio: string; expYrs: string; quals: string; spec: string; adminDuties?: string; supervised: number;
    pubs?: Array<{ title: string; authors: string; year: number; type: 'JOURNAL_ARTICLE'|'CONFERENCE_PAPER'|'BOOK_CHAPTER'|'BOOK'|'PATENT'; journal?: string; volume?: string; pages?: string; doi?: string; abstract?: string; citations: number; }>;
    courses?: Array<{ name: string; credits: number; students: number }>;
  }) => {
    let staff = await prisma.staff.findUnique({ where: { email: d.email } });
    if (staff) return staff;
    staff = await prisma.staff.create({
      data: {
        name: d.name, email: d.email, designation: d.designation, departmentId: d.deptId,
        bio: d.bio, experienceYears: d.expYrs, qualifications: d.quals, specialization: d.spec,
        administrativeDuties: d.adminDuties, studentsSupervised: d.supervised, status: 'APPROVED',
        profileVerificationStatus: 'VERIFIED',
      },
    });
    const hpw = await hashPassword(d.password);
    await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: { email: d.email, password: hpw, name: d.name, role: 'FACULTY', staffId: staff.id, isActive: true },
    });
    for (const p of d.pubs ?? []) {
      await prisma.publication.create({ data: {
        title: p.title, authors: p.authors, year: p.year, publicationType: p.type,
        journal: p.journal, volume: p.volume, pages: p.pages, doi: p.doi, abstract: p.abstract,
        citationCount: p.citations, verified: true, verificationStatus: 'VERIFIED', staffId: staff.id,
      }});
    }
    for (const c of d.courses ?? []) {
      const ex = await prisma.course.findFirst({ where: { name: c.name, staffId: staff.id } });
      if (!ex) await prisma.course.create({ data: { ...c, staffId: staff.id, verificationStatus: 'VERIFIED' } });
    }
    return staff;
  };

  // ── PRIMARY USER - Umar Ejaz ─────────────────────────────────────────────
  const umar = await mkStaff({
    name: 'Dr. Umar Ejaz', email: 'umar@mnsuam.edu.pk', password: 'Admin@2024!Secure',
    designation: 'Assistant Professor', deptId: dAgronomy.id,
    bio: 'Dr. Umar Ejaz is a researcher in precision agriculture, crop physiolog and remote sensing. He has 8 years of research experience and has collaborated with international institutions including CIMMYT and ICARDA. His work integrates GIS, IoT sensors, and machine learning for smart crop management.',
    expYrs: '8', quals: 'PhD Agronomy (University of Agriculture Faisalabad), MS Crop Science (MNSUAM), BS Agriculture',
    spec: 'Precision Agriculture, Crop Physiology, Remote Sensing, GIS, Climate-Smart Agriculture',
    adminDuties: '- Coordinator, Precision Agriculture Lab\n- Member, Research Ethics Committee\n- Faculty Advisor, MNSUAM Agricultural Society',
    supervised: 14,
    pubs: [
      { title: 'UAV-Based Multispectral Imaging for Real-Time Wheat Stress Detection', authors: 'Umar Ejaz, Abdul Qadir, N. Bibi', year: 2024, type: 'JOURNAL_ARTICLE', journal: 'Computers and Electronics in Agriculture', volume: '218', pages: '108-123', doi: '10.1016/j.compag.2024.108234', abstract: 'Integration of UAV remote sensing with machine learning for early detection of water and nutrient stress in wheat crops, achieving 94% accuracy.', citations: 18 },
      { title: 'Climate-Smart Cropping Calendars for Arid Punjab: A GIS Approach', authors: 'Umar Ejaz, F. Zahra, K. Shah', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Agricultural Systems', volume: '209', pages: '103-117', doi: '10.1016/j.agsy.2023.103667', citations: 31 },
      { title: 'Soil Carbon Sequestration Potential under Biochar Amendment in Degraded Farmlands', authors: 'Umar Ejaz, Nazia Bibi', year: 2022, type: 'JOURNAL_ARTICLE', journal: 'Soil & Tillage Research', volume: '224', pages: '45-58', doi: '10.1016/j.still.2022.105504', citations: 42 },
      { title: 'Precision Irrigation Scheduling using IoT-Enabled Soil Moisture Networks', authors: 'Umar Ejaz, H. Naveed, A. Qadir', year: 2023, type: 'CONFERENCE_PAPER', journal: 'CIGR World Congress on Agricultural Engineering', pages: '234-241', citations: 15 },
    ],
    courses: [
      { name: 'Precision Agriculture Technologies', credits: 3, students: 58 },
      { name: 'Crop Physiology and Production', credits: 4, students: 92 },
      { name: 'GIS Applications in Agriculture', credits: 3, students: 44 },
      { name: 'Research Methods in Agriculture', credits: 2, students: 67 },
    ],
  });

  // ── Other professors ─────────────────────────────────────────────────────
  const abdulQadir = await mkStaff({
    name: 'Dr. Abdul Qadir', email: 'abdul.qadir@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Professor & Head of Department', deptId: dAgronomy.id,
    bio: 'Dr. Abdul Qadir is a renowned agronomist with 22 years of experience in crop breeding, genetics, and sustainable agriculture. He has developed several high-yielding wheat and rice varieties now grown across Punjab.',
    expYrs: '22', quals: 'PhD Crop Science (UAF), MS Agronomy, BS Agriculture',
    spec: 'Plant Breeding, Crop Genetics, Sustainable Agriculture, Seed Technology',
    adminDuties: '- Head of Department\n- Director, Crop Research Station\n- Member, Punjab Seed Council',
    supervised: 65,
    pubs: [
      { title: 'Development of Drought-Tolerant Wheat Varieties for Climate Resilience', authors: 'Abdul Qadir, N. Bibi, S. Ahmed', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Field Crops Research', volume: '289', pages: '108-125', doi: '10.1016/j.fcr.2023.108234', citations: 47 },
      { title: 'Genetic Improvement of Rice for Salt Tolerance in Coastal Areas', authors: 'Abdul Qadir, M. Akram', year: 2022, type: 'JOURNAL_ARTICLE', journal: 'Crop Science', volume: '62', pages: '1234-1248', citations: 52 },
      { title: 'Participatory Varietal Selection in Wheat: Farmer Preferences and Yield Stability', authors: 'Abdul Qadir, U. Ejaz, A. Akram', year: 2021, type: 'JOURNAL_ARTICLE', journal: 'Euphytica', volume: '217', pages: '45-60', citations: 38 },
    ],
    courses: [{ name: 'Crop Production Technology', credits: 4, students: 95 }, { name: 'Plant Breeding and Genetics', credits: 3, students: 68 }],
  });

  const naziaBibi = await mkStaff({
    name: 'Dr. Nazia Bibi', email: 'nazia.bibi@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Associate Professor & Head of Department', deptId: dSoil.id,
    bio: 'Dr. Nazia Bibi is a soil scientist specialising in soil fertility, nutrient management, and environmental sustainability. Her research on organic farming has helped thousands of farmers improve crop yields while protecting soil health.',
    expYrs: '15', quals: 'PhD Soil Science (UAF), MS Soil Chemistry, BS Soil Science',
    spec: 'Soil Fertility, Nutrient Management, Organic Farming, Soil Conservation, Biochar',
    supervised: 38,
    pubs: [
      { title: 'Biochar Application for Soil Health Improvement in Degraded Agricultural Lands', authors: 'Nazia Bibi, A. Qadir, U. Ejaz', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Soil Biology and Biochemistry', volume: '178', pages: '108-123', doi: '10.1016/j.soilbio.2023.108945', citations: 42 },
      { title: 'Nitrogen Use Efficiency Improvement through Slow-Release Fertilizers in Cotton', authors: 'Nazia Bibi, K. Javed', year: 2022, type: 'JOURNAL_ARTICLE', journal: 'Field Crops Research', volume: '275', pages: '108-118', citations: 29 },
    ],
    courses: [{ name: 'Soil Fertility and Plant Nutrition', credits: 4, students: 72 }, { name: 'Organic Agriculture', credits: 3, students: 58 }],
  });

  const zainabMalik = await mkStaff({
    name: 'Dr. Zainab Malik', email: 'zainab.malik@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Professor & Head of Department', deptId: dIPBB.id,
    bio: 'Dr. Zainab Malik is a leading researcher in plant biotechnology and genomics with 15 years of experience. She has secured multiple international research grants and collaborates with CGIAR centers worldwide.',
    expYrs: '15', quals: 'PhD Plant Biotechnology (NUST), MS Biotechnology (QAU), BS Biology',
    spec: 'Plant Genomics, Molecular Breeding, Tissue Culture, CRISPR Applications in Crops',
    adminDuties: '- Head, Plant Biotechnology Lab\n- Member, National Biosafety Committee',
    supervised: 42,
    pubs: [
      { title: 'CRISPR/Cas9-Mediated Improvement of Blast Resistance in Basmati Rice', authors: 'Zainab Malik, H. Ashraf, M. Riaz', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Plant Biotechnology Journal', volume: '21', pages: '1234-1245', doi: '10.1111/pbi.13978', citations: 56 },
      { title: 'Transcriptomic Analysis of Drought Stress Response in Wheat Cultivars', authors: 'Zainab Malik, A. Qadir, U. Ejaz', year: 2022, type: 'JOURNAL_ARTICLE', journal: 'BMC Genomics', volume: '23', pages: '456-472', doi: '10.1186/s12864-022-08456-8', citations: 38 },
    ],
    courses: [{ name: 'Plant Biotechnology', credits: 4, students: 65 }, { name: 'Molecular Genetics', credits: 3, students: 48 }],
  });

  const kamranShah = await mkStaff({
    name: 'Dr. Kamran Shah', email: 'kamran.shah@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Associate Professor & Head of Department', deptId: dIPP.id,
    bio: 'Dr. Kamran Shah is an entomologist and integrated pest management specialist with 12 years of experience. He has developed several eco-friendly pest control strategies adopted by Punjab Agriculture Department.',
    expYrs: '12', quals: 'PhD Entomology (UAF), MS Plant Protection, BS Agriculture',
    spec: 'Integrated Pest Management, Biological Control, Insecticide Resistance, Cotton Pest Management',
    supervised: 20,
    pubs: [
      { title: 'Biological Control of Cotton Bollworm using Bacillus thuringiensis in Punjab', authors: 'Kamran Shah, F. Zahra, Z. Malik', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Biological Control', volume: '178', pages: '105-118', doi: '10.1016/j.biocontrol.2023.105012', citations: 32 },
    ],
    courses: [{ name: 'Integrated Pest Management', credits: 4, students: 64 }, { name: 'Agricultural Entomology', credits: 3, students: 78 }],
  });

  const hinaAshraf = await mkStaff({
    name: 'Dr. Hina Ashraf', email: 'hina.ashraf@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Professor & Head of Department', deptId: dFoodSci.id,
    bio: 'Dr. Hina Ashraf is a food scientist with 18 years in food safety, functional foods, and nutraceuticals research. She has collaborated with WHO and FAO on food fortification programs for Pakistan.',
    expYrs: '18', quals: 'PhD Food Science (UAF), MS Food Technology, BS Food Science',
    spec: 'Food Safety, Functional Foods, Nutraceuticals, Halal Food Certification, Food Processing',
    supervised: 42,
    pubs: [
      { title: 'Fortification of Wheat Flour with Micronutrients: Impact on Nutritional Status in Rural Pakistan', authors: 'Hina Ashraf, S. Malik, F. Zahra', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Food Chemistry', volume: '401', pages: '133-145', doi: '10.1016/j.foodchem.2023.133456', citations: 67 },
    ],
    courses: [{ name: 'Food Safety and Quality Control', credits: 4, students: 65 }, { name: 'Food Processing Technology', credits: 3, students: 72 }],
  });

  const usmanFarooq = await mkStaff({
    name: 'Dr. Usman Farooq', email: 'usman.farooq@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Professor & Head of Department', deptId: dAgrEcon.id,
    bio: 'Dr. Usman Farooq is an agricultural economist with 17 years of research on value chains, rural livelihoods, and market systems. He has led multiple World Bank and IFAD-funded projects on agribusiness development.',
    expYrs: '17', quals: 'PhD Agricultural Economics (LUMS), MS Economics (PIDE), BBA',
    spec: 'Agricultural Value Chains, Rural Livelihoods, Market Systems, Agribusiness Management',
    supervised: 48,
    pubs: [
      { title: 'Value Chain Analysis of Mango Export from Pakistan: Opportunities and Constraints', authors: 'Usman Farooq, I. Ahmed, R. Nawaz', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Journal of Agribusiness in Developing Countries', volume: '38', pages: '106-128', citations: 73 },
    ],
    courses: [{ name: 'Agricultural Economics', credits: 3, students: 95 }, { name: 'Agribusiness Management', credits: 3, students: 88 }],
  });

  const fatimaNutrition = await mkStaff({
    name: 'Dr. Fatima Zahra', email: 'fatima.zahra@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Associate Professor', deptId: dNutrition.id,
    bio: 'Dr. Fatima Zahra is a nutritionist specialising in maternal and child nutrition, micronutrient deficiencies, and community nutrition interventions. She has run field programs in 12 districts of Punjab.',
    expYrs: '10', quals: 'PhD Human Nutrition (QAU), MS Nutritional Sciences, BS Home Sciences',
    spec: 'Maternal and Child Nutrition, Micronutrient Deficiency, Community Nutrition, Dietary Assessment',
    supervised: 22,
    pubs: [
      { title: 'Stunting Prevalence and Determinants among Under-5 Children in Rural Punjab', authors: 'Fatima Zahra, H. Ashraf, K. Mehmood', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Nutrients', volume: '15', pages: '234-250', doi: '10.3390/nu15010234', citations: 45 },
    ],
    courses: [{ name: 'Community Nutrition', credits: 3, students: 52 }, { name: 'Maternal and Child Nutrition', credits: 3, students: 44 }],
  });

  const asadAli = await mkStaff({
    name: 'Dr. Asad Ali', email: 'asad.ali@mnsuam.edu.pk', password: 'Faculty@123',
    designation: 'Associate Professor', deptId: dCS.id,
    bio: 'Dr. Asad Ali has 14 years of research experience in machine learning, data science, and agricultural AI. He leads a data science lab focused on precision agriculture applications using satellite imagery and sensor fusion.',
    expYrs: '14', quals: 'PhD Computer Science (NED University), MS Data Science (FAST), BS Computer Science',
    spec: 'Machine Learning, Agricultural AI, Satellite Image Analysis, Sensor Fusion, Data Science',
    supervised: 28,
    pubs: [
      { title: 'Deep Learning for Crop Disease Detection from Multispectral UAV Imagery', authors: 'Asad Ali, U. Ejaz, Z. Malik', year: 2023, type: 'JOURNAL_ARTICLE', journal: 'Computers and Electronics in Agriculture', volume: '209', pages: '107-122', doi: '10.1016/j.compag.2023.107345', citations: 29 },
    ],
    courses: [{ name: 'Machine Learning', credits: 4, students: 87 }, { name: 'Data Science for Agriculture', credits: 3, students: 55 }],
  });

  console.log('✅ Staff accounts created');

  // ── Projects for umar@mnsuam.edu.pk ─────────────────────────────────────
  await prisma.project.deleteMany({ where: { staffId: umar.id } });

  const p1 = await prisma.project.create({ data: {
    title: 'UAV-Based Precision Crop Monitoring System for Smallholder Farmers',
    description: 'Development and field validation of a low-cost UAV platform integrated with multispectral sensors for real-time crop health monitoring in smallholder farms across Central Punjab. The system provides actionable recommendations through a mobile app.',
    objectives: '1. Develop an affordable UAV payload system with NDVI, NDRE, and thermal imaging capabilities.\n2. Build a machine learning pipeline for crop stress classification (water, nutrient, disease).\n3. Validate system accuracy across wheat, rice, and cotton crops over two full growing seasons.\n4. Develop a farmer-facing mobile app for interpretation of aerial maps.\n5. Conduct capacity-building workshops for 200 extension workers.',
    methodology: 'Phase 1 (Months 1-6): UAV hardware integration and sensor calibration at MNSUAM Research Farm.\nPhase 2 (Months 7-18): Field trials across 50 farms in Multan, Vehari, and Sahiwal districts.\nPhase 3 (Months 19-24): Machine learning model training using annotated multispectral datasets.\nPhase 4 (Months 25-30): App development, user testing, and extension worker training.\nPhase 5 (Months 31-36): Scale-up and impact assessment.',
    outcomes: '1. Peer-reviewed publication in Computers and Electronics in Agriculture (Q1 journal).\n2. Functional mobile app deployed to 1,000+ farmers in pilot districts.\n3. 10-15% average reduction in fertilizer over-application demonstrated.\n4. 200 extension workers trained on digital crop monitoring.\n5. IP disclosure filed for UAV payload design.',
    deliverables: 'UAV hardware prototype, annotated multispectral dataset (>10,000 images), trained ML models, mobile application (Android/iOS), training manual for extension workers, final research report, 3 peer-reviewed papers.',
    targetBeneficiaries: 'Smallholder wheat, rice, and cotton farmers in Central Punjab (direct: 1,000 farmers; indirect: 50,000 farmers through extension network). Female farmers will constitute at least 30% of training program participants.',
    projectKind: 'RESEARCH', scope: 'NATIONAL',
    thematicArea: 'Digital Agriculture & Precision Farming',
    projectCategory: 'Applied Research',
    projectType: 'GROUP',
    funderType: 'HEC',
    funderLocation: 'NATIONAL',
    financialYear: '2024-25',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2026-12-31'),
    budgetAmount: 12500000,
    currency: 'PKR',
    fundingAgency: 'Higher Education Commission (HEC)',
    fundingAgencyRefNo: 'HEC/NRPU/2024/0892',
    awardLetterDate: new Date('2024-01-05'),
    oricOverheadAmount: 1250000,
    overheadStatus: 'Approved',
    specialConditions: 'IP generated must be disclosed to ORIC within 30 days of conception. At least one publication must be open access. Quarterly progress reports required.',
    sponsoringAgency: 'Higher Education Commission of Pakistan',
    sponsorCountry: 'Pakistan',
    projectFileNo: 'ORIC/2024/AGR/001',
    reportsStatus: 'Q1 Report Submitted',
    fileStatus: 'File Active',
    remarks: 'Strong project - VC briefed at Jan 2024 Research Day. Potential for HEC Technology Transfer Award.',
    verificationStatus: 'VERIFIED', status: 'ONGOING',
    staffId: umar.id,
  }});

  await prisma.projectCoPI.createMany({ data: [
    { projectId: p1.id, name: 'Dr. Asad Ali', designation: 'Associate Professor', organization: 'Institute of Computing, MNSUAM', email: 'asad.ali@mnsuam.edu.pk', contact: '+92-300-1234567', type: 'Internal' },
    { projectId: p1.id, name: 'Dr. Nazia Bibi', designation: 'Associate Professor', organization: 'Dept. of Soil & Environmental Sciences, MNSUAM', email: 'nazia.bibi@mnsuam.edu.pk', contact: '+92-301-2345678', type: 'Internal' },
    { projectId: p1.id, name: 'Dr. Bram Govaerts', designation: 'Deputy Director General', organization: 'CIMMYT, Mexico', email: 'b.govaerts@cimmyt.org', contact: '+52-55-5804-2004', type: 'External' },
  ]});

  await prisma.projectTeamMember.createMany({ data: [
    { projectId: p1.id, name: 'Muhammad Bilal Hussain', designation: 'PhD Scholar', department: 'Department of Agronomy', role: 'UAV Pilot & Data Collection Lead' },
    { projectId: p1.id, name: 'Ayesha Siddiqui', designation: 'MS Scholar', department: 'Institute of Computing', role: 'ML Model Development' },
    { projectId: p1.id, name: 'Tariq Mehmood', designation: 'BS Final Year', department: 'Department of Agronomy', role: 'Field Trials Assistant' },
    { projectId: p1.id, name: 'Saba Noreen', designation: 'MS Scholar', department: 'Department of Agronomy', role: 'Crop Physiology Assessments' },
  ]});

  await prisma.installment.createMany({ data: [
    { projectId: p1.id, installmentNo: 1, amount: 5000000, dueDate: new Date('2024-02-01'), releaseDate: new Date('2024-02-10'), status: 'RELEASED', note: 'First tranche - equipment procurement' },
    { projectId: p1.id, installmentNo: 2, amount: 4000000, dueDate: new Date('2025-02-01'), releaseDate: null, status: 'PENDING', note: 'Second tranche - field operations' },
    { projectId: p1.id, installmentNo: 3, amount: 3500000, dueDate: new Date('2026-01-01'), releaseDate: null, status: 'PENDING', note: 'Final tranche - dissemination & wrap-up' },
  ]});

  const p2 = await prisma.project.create({ data: {
    title: 'Biochar-Mediated Carbon Sequestration and Soil Health Restoration in Degraded Farmlands of Southern Punjab',
    description: 'This project investigates the long-term effects of locally produced biochar from agricultural waste (rice husk, sugarcane bagasse) on soil carbon stocks, microbial diversity, and crop productivity in saline-degraded farmlands of Rahim Yar Khan and Bahawalpur districts.',
    objectives: '1. Produce and characterise biochar from three locally available agricultural waste streams.\n2. Assess biochar effects on soil physico-chemical properties and microbial communities over 3 seasons.\n3. Quantify soil organic carbon sequestration rates under different biochar application rates.\n4. Evaluate crop yield responses (wheat, cotton) to biochar amendment.\n5. Develop an economic model for biochar adoption by smallholder farmers.',
    methodology: 'Randomised complete block design field trials at three locations. Biochar produced from rice husk, sugarcane bagasse, and cotton stalks at MNSUAM pyrolysis unit. Treatments: control, 2.5 t/ha, 5 t/ha, and 10 t/ha biochar application rates. Soil samples collected at 0-15cm and 15-30cm depth at planting and harvest each season. Carbon analysis by dry combustion method.',
    outcomes: 'Demonstration that biochar application at 5 t/ha increases soil organic carbon by 15-25% within 2 years. Improvement in saline soil EC from >4 dS/m to <2 dS/m. Wheat yield increase of 12-18%. Peer-reviewed publications in Q1 soil science journals.',
    deliverables: 'Biochar characterisation database, 3-year soil health monitoring dataset, economic feasibility report, 2 peer-reviewed papers, policy brief for Punjab Agriculture Department.',
    targetBeneficiaries: 'Farmers in saline-degraded areas of Rahim Yar Khan and Bahawalpur (estimated 15,000 farm households). Punjab Agriculture Department extension programme.',
    projectKind: 'RESEARCH', scope: 'NATIONAL',
    thematicArea: 'Soil Science & Climate Change',
    projectCategory: 'Basic Research',
    projectType: 'JOINT',
    funderType: 'PSF',
    funderLocation: 'NATIONAL',
    financialYear: '2023-24',
    startDate: new Date('2023-04-01'),
    endDate: new Date('2026-03-31'),
    budgetAmount: 8750000,
    currency: 'PKR',
    fundingAgency: 'Pakistan Science Foundation (PSF)',
    fundingAgencyRefNo: 'PSF/RES/C-QAU/Agr(553)',
    awardLetterDate: new Date('2023-03-15'),
    oricOverheadAmount: 875000,
    overheadStatus: 'Approved',
    projectFileNo: 'ORIC/2023/AGR/007',
    reportsStatus: 'Annual Report Due',
    fileStatus: 'File Active',
    remarks: 'Joint project with QAU Islamabad. PARB expressed interest in co-funding second phase.',
    verificationStatus: 'VERIFIED', status: 'ONGOING',
    staffId: umar.id,
  }});

  await prisma.projectCoPI.createMany({ data: [
    { projectId: p2.id, name: 'Dr. Nazia Bibi', designation: 'Associate Professor', organization: 'MNSUAM', email: 'nazia.bibi@mnsuam.edu.pk', type: 'Internal' },
    { projectId: p2.id, name: 'Dr. Rizwan Ahmad', designation: 'Associate Professor', organization: 'Quaid-i-Azam University, Islamabad', email: 'r.ahmad@qau.edu.pk', type: 'External' },
  ]});

  await prisma.projectTeamMember.createMany({ data: [
    { projectId: p2.id, name: 'Hifza Rana', designation: 'PhD Scholar', department: 'Soil & Environmental Sciences', role: 'Soil Carbon Analysis Lead' },
    { projectId: p2.id, name: 'Abdul Rehman', designation: 'MS Scholar', department: 'Department of Agronomy', role: 'Field Trials Coordinator' },
    { projectId: p2.id, name: 'Maria Khan', designation: 'MS Scholar', department: 'Soil & Environmental Sciences', role: 'Microbial Diversity Analysis' },
  ]});

  await prisma.installment.createMany({ data: [
    { projectId: p2.id, installmentNo: 1, amount: 3500000, dueDate: new Date('2023-05-01'), releaseDate: new Date('2023-05-18'), status: 'RELEASED', note: 'Setup, equipment & baseline survey' },
    { projectId: p2.id, installmentNo: 2, amount: 3000000, dueDate: new Date('2024-05-01'), releaseDate: new Date('2024-05-22'), status: 'RELEASED', note: 'Year 2 operations' },
    { projectId: p2.id, installmentNo: 3, amount: 2250000, dueDate: new Date('2025-05-01'), status: 'PENDING', note: 'Final year & publications' },
  ]});

  const p3 = await prisma.project.create({ data: {
    title: 'Industry Consultancy: Precision Fertilizer Recommendation System for Fauji Fertilizer Company',
    description: 'Development of a data-driven fertilizer recommendation engine integrating satellite soil indices, weather APIs, and historical yield data for Fauji Fertilizer Companys agronomist advisory platform serving 500,000+ farmers.',
    objectives: '1. Build soil fertility prediction models using Sentinel-2 satellite data.\n2. Integrate real-time weather data into fertilizer dose calculations.\n3. Develop REST API for integration with Fauji Kisaan App.\n4. Validate recommendations against soil test results for 1,000 farms.\n5. Train Fauji agronomists on system use.',
    methodology: 'Machine learning regression models (Random Forest, XGBoost) trained on 5-year soil test database from Punjab Agriculture Department. Integration of Copernicus NDVI, NDRE data. API development in Python/FastAPI. Validation through paired comparison with traditional soil testing on 50 benchmark farms.',
    outcomes: 'Production-ready API integrated in Fauji Kisaan App. Fertilizer use efficiency improvement of 8-12%. 500 Fauji agronomists trained. Technical report and potential joint patent filing on recommendation algorithm.',
    deliverables: 'Soil fertility prediction ML models, REST API, validation report, training materials, code repository, technical documentation.',
    targetBeneficiaries: 'Fauji Fertilizer Company and their 500,000+ registered farmer clients nationwide.',
    projectKind: 'INDUSTRY', scope: 'NATIONAL',
    thematicArea: 'AgriTech & Digital Farming',
    projectCategory: 'Applied Research',
    projectType: 'INDIVIDUAL',
    funderType: 'INDUSTRY',
    funderLocation: 'NATIONAL',
    financialYear: '2024-25',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-05-31'),
    budgetAmount: 4800000,
    currency: 'PKR',
    fundingAgency: 'Fauji Fertilizer Company (FFC)',
    fundingAgencyRefNo: 'FFC/R&D/2024/MNSUAM/03',
    awardLetterDate: new Date('2024-05-20'),
    oricOverheadAmount: 480000,
    overheadStatus: 'Approved',
    counterpartName: 'Mr. Shaukat Tarin',
    sponsoringAgency: 'Fauji Fertilizer Company Ltd.',
    sponsorCountry: 'Pakistan',
    projectFileNo: 'ORIC/2024/IND/004',
    specialConditions: 'Code ownership shared 50/50 between MNSUAM and FFC. MNSUAM retains right to publish anonymised research findings after 12-month embargo.',
    reportsStatus: 'Inception Report Submitted',
    fileStatus: 'File Active',
    verificationStatus: 'VERIFIED', status: 'ONGOING',
    staffId: umar.id,
  }});

  await prisma.projectTeamMember.createMany({ data: [
    { projectId: p3.id, name: 'Dr. Asad Ali', designation: 'Co-Investigator', department: 'Institute of Computing', role: 'ML Pipeline Development' },
    { projectId: p3.id, name: 'Junaid Akhtar', designation: 'MS Scholar', department: 'Computer Science', role: 'API Development' },
  ]});

  await prisma.installment.createMany({ data: [
    { projectId: p3.id, installmentNo: 1, amount: 2400000, dueDate: new Date('2024-06-15'), releaseDate: new Date('2024-06-20'), status: 'RELEASED', note: 'Inception payment' },
    { projectId: p3.id, installmentNo: 2, amount: 2400000, dueDate: new Date('2025-01-01'), status: 'PENDING', note: 'Milestone 2 - API delivery & validation' },
  ]});

  // Pending project from umar
  const p4 = await prisma.project.create({ data: {
    title: 'ICARDA-Funded Climate Adaptation of Lentil Germplasm for Arid Environments',
    description: 'International collaborative research with ICARDA (Morocco) to evaluate and adapt 200 lentil germplasm accessions for heat and drought tolerance in arid and semi-arid zones of Pakistan.',
    objectives: '1. Screen 200 ICARDA lentil lines for heat tolerance under field conditions at MNSUAM and Arid Zone Research Centre, Bhakkar.\n2. Identify molecular markers associated with heat and drought tolerance.\n3. Cross elite ICARDA lines with locally adapted Pakistani varieties.\n4. Release at least 2 new lentil varieties by project end.',
    methodology: 'Multi-location trials at MNSUAM (Multan), AZRC (Bhakkar), and NARC (Islamabad). Evaluation of 200 germplasm accessions under heat-stressed and control environments. Marker-assisted selection using SSR and SNP panels. Hybridization of top-performing lines with Pakistani varieties.',
    outcomes: '2-3 heat-tolerant lentil varieties recommended for national variety release. Molecular marker panel for screening heat tolerance published. 3-5 peer-reviewed publications in Q1 journals.',
    deliverables: 'Germplasm evaluation database, molecular marker report, 2 new variety candidates, 3 papers, policy brief for Ministry of National Food Security.',
    targetBeneficiaries: 'Dryland smallholder farmers in Bhakkar, Mianwali, D.I. Khan, and Balochistan pulse-growing areas (est. 180,000 farm households).',
    projectKind: 'RESEARCH', scope: 'INTERNATIONAL',
    thematicArea: 'Crop Improvement & Genetic Resources',
    projectCategory: 'Applied Research',
    projectType: 'JOINT',
    funderType: 'INTERNATIONAL',
    funderLocation: 'INTERNATIONAL',
    financialYear: '2025-26',
    budgetAmount: 18500000,
    currency: 'PKR',
    fundingAgency: 'International Center for Agricultural Research in the Dry Areas (ICARDA)',
    sponsoringAgency: 'ICARDA / CGIAR',
    sponsorCountry: 'Morocco',
    counterpartName: 'Dr. Shiv Kumar, Head of Legume Breeding, ICARDA',
    verificationStatus: 'PENDING', status: 'SUBMITTED',
    staffId: umar.id,
  }});

  await prisma.projectCoPI.createMany({ data: [
    { projectId: p4.id, name: 'Dr. Abdul Qadir', designation: 'Professor', organization: 'MNSUAM', email: 'abdul.qadir@mnsuam.edu.pk', type: 'Internal' },
    { projectId: p4.id, name: 'Dr. Shiv Kumar', designation: 'Head, Legume Breeding', organization: 'ICARDA, Morocco', email: 's.kumar@icarda.org', type: 'External' },
  ]});

  // ── Projects for other faculty ────────────────────────────────────────────
  const pAQ = await prisma.project.create({ data: {
    title: 'Climate-Smart Wheat Breeding Program: Developing Heat and Drought Dual-Tolerant Varieties',
    description: 'A 5-year national wheat breeding program targeting simultaneous improvement of heat tolerance and drought resistance using genomic selection and marker-assisted backcrossing.',
    objectives: '1. Establish a reference panel of 500 wheat accessions phenotyped for heat and drought tolerance.\n2. Identify genomic regions (QTLs) controlling heat and drought tolerance using GWAS.\n3. Develop 10 pre-breeding lines with stacked tolerance QTLs.\n4. Release 2-3 commercial varieties for rainfed and late-sown wheat zones.',
    methodology: 'GWAS using 90K SNP array on 500 genotypes evaluated at 4 locations over 3 seasons. Marker-assisted backcrossing to introgress identified QTLs. Genomic selection for complex traits. Multi-environment trials under heat (late-sown) and drought (rainout shelter) stress.',
    outcomes: 'Genomic selection models for heat and drought tolerance. 2 commercial wheat varieties released. 5+ peer-reviewed publications. Germplasm shared with PARC and provincial seeds corporations.',
    deliverables: 'SNP genotyping dataset, GWAS results, genomic prediction models, breeding line development report, 2 DUS applications, 5 publications.',
    targetBeneficiaries: 'Wheat farmers in rainfed and late-sown areas of Punjab and KPK (est. 2 million farm households). Pakistan\'s national food security programme.',
    projectKind: 'RESEARCH', scope: 'NATIONAL',
    thematicArea: 'Plant Breeding & Genomics',
    projectCategory: 'Strategic Research',
    projectType: 'GROUP',
    funderType: 'HEC',
    funderLocation: 'NATIONAL',
    financialYear: '2022-23',
    startDate: new Date('2022-07-01'),
    endDate: new Date('2027-06-30'),
    budgetAmount: 22000000,
    currency: 'PKR',
    fundingAgency: 'Higher Education Commission (HEC)',
    fundingAgencyRefNo: 'HEC/NRPU/2022/0234',
    awardLetterDate: new Date('2022-06-20'),
    oricOverheadAmount: 2200000, overheadStatus: 'Approved',
    projectFileNo: 'ORIC/2022/AGR/003',
    verificationStatus: 'VERIFIED', status: 'ONGOING',
    staffId: abdulQadir.id,
  }});

  await prisma.projectCoPI.createMany({ data: [
    { projectId: pAQ.id, name: 'Dr. Zainab Malik', designation: 'Professor', organization: 'MNSUAM', email: 'zainab.malik@mnsuam.edu.pk', type: 'Internal' },
    { projectId: pAQ.id, name: 'Dr. Umar Ejaz', designation: 'Assistant Professor', organization: 'MNSUAM', email: 'umar@mnsuam.edu.pk', type: 'Internal' },
  ]});

  await prisma.installment.createMany({ data: [
    { projectId: pAQ.id, installmentNo: 1, amount: 7000000, dueDate: new Date('2022-08-01'), releaseDate: new Date('2022-08-15'), status: 'RELEASED', note: 'Year 1' },
    { projectId: pAQ.id, installmentNo: 2, amount: 7000000, dueDate: new Date('2024-07-01'), releaseDate: new Date('2024-07-10'), status: 'RELEASED', note: 'Year 3' },
    { projectId: pAQ.id, installmentNo: 3, amount: 8000000, dueDate: new Date('2026-07-01'), status: 'PENDING', note: 'Years 4-5' },
  ]});

  const pNB = await prisma.project.create({ data: {
    title: 'Microbiome-Assisted Soil Reclamation for Saline-Waterlogged Lands in Indus Basin',
    description: 'Application of salt-tolerant rhizobacteria and arbuscular mycorrhizal fungi consortia for biological reclamation of saline-waterlogged agricultural lands in the Indus Basin.',
    objectives: '1. Isolate and characterise 50+ salt-tolerant plant growth-promoting rhizobacteria (PGPR) from saline soils.\n2. Develop microbial consortia for biostimulant application.\n3. Field-test consortia on rice, wheat, and sugarcane in saline conditions.\n4. Develop commercial bio-inoculant formulation.',
    methodology: 'Soil sampling from 20 saline-waterlogged sites. Microbial isolation, characterisation, and screening. Greenhouse trials to evaluate PGPR effects on salt tolerance. Multi-site field trials. Bio-inoculant formulation development with industrial partner.',
    outcomes: 'Bio-inoculant product prototype. 30% improvement in crop yield under saline conditions. 2 IP disclosures filed. 3 publications in Q1 journals. Collaboration with fertilizer company for commercialisation.',
    deliverables: 'PGPR culture bank, biostimulant formulation, field trial reports, IP disclosure, 3 papers.',
    targetBeneficiaries: 'Farmers on 2.6 million hectares of saline-waterlogged land in Sindh and Southern Punjab.',
    projectKind: 'RESEARCH', scope: 'NATIONAL',
    thematicArea: 'Soil Microbiology & Land Reclamation',
    projectCategory: 'Applied Research',
    projectType: 'GROUP',
    funderType: 'PARB',
    funderLocation: 'NATIONAL',
    financialYear: '2023-24',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2026-07-31'),
    budgetAmount: 9500000,
    currency: 'PKR',
    fundingAgency: 'Punjab Agriculture Research Board (PARB)',
    fundingAgencyRefNo: 'PARB/2023/R&D/089',
    oricOverheadAmount: 950000, overheadStatus: 'Approved',
    projectFileNo: 'ORIC/2023/AGR/012',
    verificationStatus: 'VERIFIED', status: 'ONGOING',
    staffId: naziaBibi.id,
  }});

  await prisma.installment.createMany({ data: [
    { projectId: pNB.id, installmentNo: 1, amount: 4000000, dueDate: new Date('2023-09-01'), releaseDate: new Date('2023-09-12'), status: 'RELEASED', note: 'Setup & baseline' },
    { projectId: pNB.id, installmentNo: 2, amount: 3500000, dueDate: new Date('2025-01-01'), status: 'PENDING', note: 'Field operations' },
    { projectId: pNB.id, installmentNo: 3, amount: 2000000, dueDate: new Date('2026-04-01'), status: 'PENDING', note: 'Finalisation & IP' },
  ]});

  // ── ORIC Records ─────────────────────────────────────────────────────────
  console.log('🔬 Seeding ORIC records...');

  // Patents
  await prisma.patent.deleteMany({});
  await prisma.patent.createMany({ data: [
    {
      title: 'Drought-Tolerant Wheat Cultivar "MNSU-Gold-1"',
      leadInventor: 'Dr. Abdul Qadir',
      designation: 'Professor & Head of Department',
      department: 'Department of Agronomy',
      coInventors: 'Dr. Umar Ejaz, Dr. Nazia Bibi, Muhammad Bilal Hussain',
      ipCategory: 'Variety/Cultivar',
      developmentStatus: 'Production Ready',
      keyAspects: 'Novel wheat variety with 40% better yield under drought stress through deeper root architecture and osmotic adjustment. Suitable for rainfed areas of Punjab and KPK. 3 seasons of multi-location trial data available.',
      commercialPartner: 'Punjab Seed Corporation',
      financialSupport: 'HEC NRPU Grant PKR 22M',
      filedWith: 'FSC&RD',
      scope: 'NATIONAL',
      filingDate: new Date('2023-06-15'),
      applicationNumber: 'FSC-2023-0456',
      patentStatus: 'Under Examination',
      ipoStatus: 'Technical examination in progress',
      ipoExaminer: 'Dr. Zahid Hussain, Senior Examiner FSC&RD',
      ipoLastActionDate: new Date('2024-01-20'),
      ipoComments: 'DUS data under review; additional distinctness evidence requested for growth habit under irrigated conditions',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Bio-Pesticide Formulation from Neem + Moringa Extract',
      leadInventor: 'Dr. Kamran Shah',
      designation: 'Associate Professor & Head of Department',
      department: 'Institute of Plant Protection (IPP)',
      coInventors: 'Dr. Zainab Malik, Muhammad Naeem Asghar',
      ipCategory: 'Process',
      developmentStatus: 'Validation',
      keyAspects: 'Eco-friendly biopesticide effective against cotton bollworm (Helicoverpa armigera) and mealy bug. Reduces chemical pesticide use by 70%. Stable shelf life >18 months. Cost 40% lower than commercial alternatives.',
      commercialPartner: 'Engro Fertilizers Ltd.',
      financialSupport: 'PSF Research Grant PKR 3.2M',
      filedWith: 'IPO Pakistan',
      scope: 'NATIONAL',
      filingDate: new Date('2023-09-20'),
      applicationNumber: 'IPO-2023-12345',
      patentStatus: 'Filed',
      ipoStatus: 'Formality check completed; awaiting substantive examination',
      ipoLastActionDate: new Date('2023-12-05'),
      staffId: kamranShah.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Low-Cost Solar-Powered Precision Irrigation Controller with IoT Soil Sensing',
      leadInventor: 'Dr. Umar Ejaz',
      designation: 'Assistant Professor',
      department: 'Department of Agronomy',
      coInventors: 'Dr. Asad Ali, Ayesha Siddiqui',
      ipCategory: 'Technology',
      developmentStatus: 'Prototype',
      keyAspects: 'IoT-enabled low-cost solar irrigation controller integrating capacitive soil moisture sensors, weather station data, and crop ET models. Reduces irrigation water use by 35%. Unit cost PKR 12,000 - 80% cheaper than imported alternatives.',
      filedWith: 'IPO Pakistan',
      scope: 'NATIONAL',
      filingDate: new Date('2024-01-10'),
      applicationNumber: 'IPO-2024-00231',
      patentStatus: 'Filed',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'CRISPR-Modified Salt-Tolerant Rice "MNSU-Saline-1" for Coastal and Waterlogged Areas',
      leadInventor: 'Dr. Zainab Malik',
      designation: 'Professor & Head of Department',
      department: 'Institute of Plant Breeding and Biotechnology',
      coInventors: 'Dr. Nazia Bibi, Dr. Abdul Qadir, Hifza Rana',
      ipCategory: 'Variety/Cultivar',
      developmentStatus: 'Validation',
      keyAspects: 'CRISPR/Cas9-edited rice with OsNHX1 overexpression conferring high sodium compartmentalisation. 45% yield improvement over check variety under EC >8 dS/m. Maintained grain quality parameters (amylose, protein).',
      commercialPartner: 'Rice Research Institute Kala Shah Kaku',
      financialSupport: 'CGIAR Excellence in Breeding Platform',
      filedWith: 'FSC&RD',
      scope: 'NATIONAL',
      filingDate: new Date('2024-03-01'),
      applicationNumber: 'FSC-2024-0089',
      patentStatus: 'Filed',
      ipoStatus: 'Biosafety clearance pending from COMEST',
      staffId: zainabMalik.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // IP Disclosures
  await prisma.iPDisclosure.deleteMany({});
  await prisma.iPDisclosure.createMany({ data: [
    {
      title: 'Biofortified Maize Line with 2x Zinc Content for Combating Hidden Hunger',
      leadInventor: 'Dr. Abdul Qadir',
      designation: 'Professor',
      department: 'Department of Agronomy',
      ipCategory: 'Variety/Cultivar',
      developmentStatus: 'Validation',
      scope: 'NATIONAL',
      keyAspects: 'Biofortified maize line with 2x higher zinc content (from 18ppm to 38ppm) through conventional breeding with CIMMYT HarvestPlus germplasm. No yield penalty. Consumer acceptability trials positive.',
      commercialPartner: 'Punjab Seed Corporation, HarvestPlus CGIAR',
      financialSupport: 'HarvestPlus / CGIAR (USD 45,000)',
      disclosureMadeWith: 'HarvestPlus CGIAR program agreed to share commercialisation rights in ratio 60:40 (MNSUAM:HarvestPlus)',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Multi-Spectral UAV Crop Stress Index - "AgriScan-UAV" Software',
      leadInventor: 'Dr. Umar Ejaz',
      designation: 'Assistant Professor',
      department: 'Department of Agronomy',
      ipCategory: 'Software',
      developmentStatus: 'Prototype',
      scope: 'NATIONAL',
      keyAspects: 'Proprietary ML pipeline for processing UAV multispectral imagery into actionable crop stress maps. Combines NDVI, NDRE, CWSI indices with field calibration for wheat, rice, and cotton. Mobile app component for farmer interface.',
      commercialPartner: 'TechVentures Agriculture (Pvt) Ltd.',
      financialSupport: 'HEC NRPU PKR 12.5M + ORIC seed grant PKR 200,000',
      disclosureMadeWith: 'Disclosure made to ORIC on 2024-03-15. IP committee review scheduled for May 2024.',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'PGPR Biostimulant Consortia for Saline Soil Reclamation',
      leadInventor: 'Dr. Nazia Bibi',
      designation: 'Associate Professor',
      department: 'Department of Soil and Environmental Sciences',
      ipCategory: 'Process',
      developmentStatus: 'Validation',
      scope: 'NATIONAL',
      keyAspects: 'Novel salt-tolerant PGPR consortia (Bacillus halotolerans + Pseudomonas stutzeri strains) isolated from Indus Basin saline soils. Bio-inoculant improves wheat germination by 40% under EC 8 dS/m conditions. Formulation patent pending.',
      financialSupport: 'PARB Grant PKR 9.5M',
      disclosureMadeWith: 'Co-disclosed with Dr. Rizwan Ahmad (QAU). Agreement on IP sharing under execution.',
      staffId: naziaBibi.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // IP Licensing
  await prisma.iPLicensing.deleteMany({});
  await prisma.iPLicensing.createMany({ data: [
    {
      title: 'Neem Bio-Pesticide Technology License to Green Crop Pakistan',
      leadInventor: 'Dr. Kamran Shah',
      designationDept: 'Associate Professor, Institute of Plant Protection',
      ipCategory: 'Process',
      developmentStatus: 'Commercialized',
      scope: 'NATIONAL',
      keyAspects: 'Technology transfer of neem extract biopesticide formulation process to Green Crop Pakistan for commercial production and national distribution.',
      fieldOfUse: 'Commercial manufacture and sale of biopesticide in Pakistan for cotton, sugarcane, and vegetable crops',
      agreementDuration: '5 years (2023-2028) with renewal option',
      negotiationStatus: 'Agreement Signed',
      licenseeName: 'Green Crop Pakistan (Pvt) Ltd.',
      staffId: kamranShah.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'MNSU-Gold-1 Wheat Variety Seed Multiplication License - Punjab Seed Corporation',
      leadInventor: 'Dr. Abdul Qadir',
      designationDept: 'Professor & HOD, Department of Agronomy',
      ipCategory: 'Variety/Cultivar',
      developmentStatus: 'Production Ready',
      scope: 'NATIONAL',
      keyAspects: 'Non-exclusive license to Punjab Seed Corporation for multiplication and commercial sale of MNSU-Gold-1 wheat breeder seed across Punjab province.',
      fieldOfUse: 'Seed multiplication and commercial distribution within Punjab Province only',
      agreementDuration: 'Conditional upon FSC&RD grant - 10 years from variety registration',
      negotiationStatus: 'Under Negotiation',
      licenseeName: 'Punjab Seed Corporation',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // Consultancies
  await prisma.consultancy.deleteMany({});
  await prisma.consultancy.createMany({ data: [
    {
      title: 'Soil Fertility Assessment and Fertilizer Recommendation - Pakpattan District',
      clientName: 'Punjab Agriculture Department',
      clientCountry: 'Pakistan',
      clientAddress: 'Agriculture House, 21-Agha Khan Road, Lahore',
      executionDate: new Date('2023-06-15'),
      serviceType: 'Feasibility Study',
      deliverables: 'District-level soil fertility maps (180 tehsil-wise grids), fertilizer recommendation booklet in Urdu, 5 training workshops for extension workers, digital data repository for Agriculture Department GIS system.',
      contractValue: 2500000,
      oricOverheadPercent: 10,
      oricOverheadAmount: 250000,
      startDate: new Date('2023-07-01'),
      endDate: new Date('2024-06-30'),
      status: 'Completed',
      remarks: 'Successfully completed. Agriculture Department requested follow-up study for Sahiwal District. Certificate of appreciation received.',
      staffId: naziaBibi.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Precision Fertilizer Recommendation API Development for Fauji Fertilizer Company',
      clientName: 'Fauji Fertilizer Company (FFC)',
      clientCountry: 'Pakistan',
      clientAddress: 'FFC Head Office, 93-Harley Street, Rawalpindi',
      executionDate: new Date('2024-05-20'),
      serviceType: 'Technical Advisory',
      deliverables: 'ML-based fertilizer recommendation engine, REST API integration for Kisaan App, agronomist training program (500 participants), validation report, technical documentation.',
      contractValue: 4800000,
      oricOverheadPercent: 10,
      oricOverheadAmount: 480000,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      status: 'Ongoing',
      remarks: 'Linked to Project ORIC/2024/IND/004. Inception report submitted and approved.',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Integrated Pest Management Strategy for Cotton Belt - Adamjee Agri Group',
      clientName: 'Adamjee Agri Group',
      clientCountry: 'Pakistan',
      clientAddress: 'Adamjee House, I.I. Chundrigar Road, Karachi',
      executionDate: new Date('2023-10-01'),
      serviceType: 'Technical Advisory',
      deliverables: 'Integrated pest management plan, field advisory visits (12 visits over 6 months), consolidated final report with actionable recommendations, pesticide use audit.',
      contractValue: 1800000,
      oricOverheadPercent: 10,
      oricOverheadAmount: 180000,
      startDate: new Date('2023-10-15'),
      endDate: new Date('2024-04-30'),
      status: 'Completed',
      staffId: kamranShah.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Nutritional Fortification Program Design for Rural Schools - UNICEF Pakistan',
      clientName: 'UNICEF Pakistan',
      clientCountry: 'Pakistan',
      clientAddress: 'UNICEF Pakistan, United Nations Building, G-5/1, Islamabad',
      executionDate: new Date('2023-03-10'),
      serviceType: 'Technical Advisory',
      deliverables: 'Nutritional assessment of 1,500 school children in 4 districts, school meal program design, impact evaluation framework, training manual for school nutrition coordinators, quarterly progress reports.',
      contractValue: 3400000,
      oricOverheadPercent: 10,
      oricOverheadAmount: 340000,
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      status: 'Completed',
      remarks: 'Outstanding performance. UNICEF extended with Phase-2 discussions underway.',
      staffId: fatimaNutrition.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Mango Value Chain Assessment and Export Readiness Report',
      clientName: 'Pakistan Horticulture Development & Export Company (PHDEC)',
      clientCountry: 'Pakistan',
      clientAddress: '53-I, Jinnah Avenue, Blue Area, Islamabad',
      executionDate: new Date('2024-02-01'),
      serviceType: 'Feasibility Study',
      deliverables: 'Full value chain mapping for Chaunsa, Sindhri, and Langra varieties, export market analysis, post-harvest loss reduction recommendations, EurepGAP compliance gap analysis.',
      contractValue: 2100000,
      oricOverheadPercent: 10,
      oricOverheadAmount: 210000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      status: 'Ongoing',
      staffId: usmanFarooq.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Food Safety Audit and Halal Certification Readiness Assessment - Shan Foods',
      clientName: 'Shan Foods (Pvt) Ltd.',
      clientCountry: 'Pakistan',
      clientAddress: 'Shan Foods, Plot A-5, SITE Area, Karachi',
      executionDate: new Date('2023-08-01'),
      serviceType: 'Testing & Analysis',
      deliverables: 'Complete food safety audit against FSSC 22000, halal compliance gap analysis, corrective action plan, pre-certification training for 200 staff, laboratory test reports for 50 product lines.',
      contractValue: 3800000,
      oricOverheadPercent: 10,
      oricOverheadAmount: 380000,
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-02-28'),
      status: 'Completed',
      remarks: 'Shan Foods successfully obtained FSSC 22000 certification. Excellent client feedback. Repeat engagement for 2024 expected.',
      staffId: hinaAshraf.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // MoUs
  await prisma.mou.deleteMany({});
  await prisma.mou.createMany({ data: [
    {
      partyName: 'University of Agriculture Faisalabad (UAF)',
      linkageType: 'Research',
      partyType: 'Academia',
      establishmentDate: new Date('2022-03-10'),
      scope: 'NATIONAL',
      country: 'Pakistan',
      duration: '3 years (2022-2025)',
      status: 'Active',
      focalPersonMnsuam: 'Director ORIC, MNSUAM',
      focalPersonOther: 'Director Research, UAF',
      scopeOfCollaboration: 'Joint research projects in crop sciences, seed technology, climate-smart agriculture, and soil health. Graduate student exchange programme. Joint PhD co-supervision.',
      activities: 'Biannual joint research seminars, graduate student exchange (4 students/year), joint HEC/PARB grant applications, shared use of research equipment.',
      futureInitiatives: 'Proposal for joint Centre of Excellence in Climate-Smart Agriculture under HEC Thematic Research Grant.',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      partyName: 'International Maize and Wheat Improvement Center (CIMMYT)',
      linkageType: 'Research',
      partyType: 'Government',
      establishmentDate: new Date('2021-09-01'),
      scope: 'INTERNATIONAL',
      country: 'Mexico',
      duration: '5 years (2021-2026)',
      status: 'Active',
      focalPersonMnsuam: 'Dr. Abdul Qadir',
      focalPersonOther: 'Dr. B. Govaerts, Deputy Director General',
      scopeOfCollaboration: 'Climate-resilient crop breeding, seed systems, food security research. Access to CIMMYT global germplasm bank. Joint breeding trials.',
      activities: 'Annual joint breeding trials at MNSUAM and CIMMYT Mexico stations; researcher exchange visits; shared germplasm access; joint publications.',
      futureInitiatives: 'Application to USAID Feed the Future for joint wheat improvement project (USD 2.5M proposal in preparation).',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      partyName: 'Engro Fertilizers Ltd.',
      linkageType: 'Academic',
      partyType: 'Industry',
      establishmentDate: new Date('2023-01-15'),
      scope: 'NATIONAL',
      country: 'Pakistan',
      duration: '2 years (2023-2025)',
      status: 'Active',
      focalPersonMnsuam: 'Director ORIC, MNSUAM',
      focalPersonOther: 'Head of R&D, Engro Fertilizers',
      scopeOfCollaboration: 'Applied research on fertilizer efficacy and precision application, student internships at Engro R&D facilities, technology transfer for bio-pesticide commercialisation.',
      activities: '10 student internships per year; quarterly technical advisory meetings; joint trials at MNSUAM Research Farm with Engro products.',
      staffId: kamranShah.id,
      verificationStatus: 'VERIFIED',
    },
    {
      partyName: 'Wageningen University & Research (WUR)',
      linkageType: 'Research',
      partyType: 'Academia',
      establishmentDate: new Date('2020-06-20'),
      scope: 'INTERNATIONAL',
      country: 'Netherlands',
      duration: '5 years (2020-2025)',
      status: 'Active',
      focalPersonMnsuam: 'Dr. Nazia Bibi',
      focalPersonOther: 'Prof. L. Brussaard, Soil Biology Chair',
      scopeOfCollaboration: 'Soil health research, sustainable land management, PhD co-supervision, joint EU Horizon Europe research proposals.',
      activities: 'Annual researcher exchange; 2 co-supervised PhD students; joint Horizon Europe proposal submitted in 2023; shared soil microbiology protocols.',
      futureInitiatives: 'Horizon Europe application "IndusSOIL" under evaluation by EC (EUR800K, decision expected Q3 2024).',
      staffId: naziaBibi.id,
      verificationStatus: 'VERIFIED',
    },
    {
      partyName: 'Punjab Agriculture Research Board (PARB)',
      linkageType: 'Research',
      partyType: 'Government',
      establishmentDate: new Date('2022-11-01'),
      scope: 'NATIONAL',
      country: 'Pakistan',
      duration: '3 years (2022-2025)',
      status: 'Active',
      focalPersonMnsuam: 'Director ORIC, MNSUAM',
      focalPersonOther: 'Chairman PARB',
      scopeOfCollaboration: 'Collaborative research grants, technology dissemination, extension services linkage, joint technology transfer events.',
      activities: 'Quarterly PARB-funded project reviews at MNSUAM; joint technology days; co-organised farmer training programs.',
      staffId: naziaBibi.id,
      verificationStatus: 'VERIFIED',
    },
    {
      partyName: 'ICARDA (International Center for Agricultural Research in Dry Areas)',
      linkageType: 'Research',
      partyType: 'Government',
      establishmentDate: new Date('2024-01-10'),
      scope: 'INTERNATIONAL',
      country: 'Morocco',
      duration: '5 years (2024-2029)',
      status: 'Active',
      focalPersonMnsuam: 'Dr. Umar Ejaz',
      focalPersonOther: 'Dr. Shiv Kumar, Head of Legume Breeding',
      scopeOfCollaboration: 'Lentil and chickpea germplasm evaluation and adaptation, marker-assisted breeding, shared germplasm access from ICARDA genebank.',
      activities: 'Biannual germplasm trials; researcher mobility grants; joint IFAD and USAID funding applications.',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // Industrial Visits
  await prisma.industrialVisit.deleteMany({});
  await prisma.industrialVisit.createMany({ data: [
    {
      visitorName: 'R&D Delegation - Fauji Fertilizer Company',
      visitorOrg: 'Fauji Fertilizer Company - Research & Development Division (12 persons)',
      visitDate: new Date('2024-02-14'),
      agenda: 'Technical presentation on UAV-based precision fertilizer recommendations. Site tour of MNSUAM Agricultural Research Farm and Precision Agriculture Lab. Discussion of ongoing consultancy project scope. Meeting with Department of Agronomy faculty.',
      departmentVisited: 'Department of Agronomy, Precision Agriculture Lab',
      visitType: 'Industry',
      outcome: 'Consultancy agreement scope expanded to include real-time sensor integration. Additional PKR 800,000 allocated for sensor hardware. Letter of intent for 2025-26 renewal signed.',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      visitorName: 'USAID AgriLinks Program Mission',
      visitorOrg: 'USAID - AgriLinks Program Pakistan (Mission Director + 4 technical staff)',
      visitDate: new Date('2023-11-08'),
      agenda: 'Review of MNSUAM research portfolio for USAID grant alignment. Presentation on Climate-Smart Agriculture projects. Discussion of potential co-financing for CIMMYT joint breeding program.',
      departmentVisited: 'ORIC, Department of Agronomy, Institute of Plant Breeding',
      visitType: 'Government',
      outcome: 'USAID expressed strong interest in co-financing ICARDA lentil project. Concept note requested by January 2024. Introduction to USAID Competitive Grants Program facilitated.',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      visitorName: 'PASHA AgriTech Delegation',
      visitorOrg: 'Pakistan Software Houses Association (PASHA) - AgriTech Working Group (8 companies, 22 representatives)',
      visitDate: new Date('2024-01-22'),
      agenda: 'Industry-academia linkage forum for AgriTech sector. Demonstration of UAV crop monitoring technology and Precision Irrigation Controller prototype. Student startup pitch presentations. Discussion of HR pipeline and graduate employment.',
      departmentVisited: 'Department of Agricultural Engineering, Institute of Computing, Precision Agriculture Lab',
      visitType: 'Industry',
      outcome: 'Annual MNSUAM AgriTech Hackathon partnership agreed (PASHA to provide PKR 500,000 prize fund). 3 PASHA member companies committed graduate employment offers (15 positions for class of 2024). Two companies expressed interest in licensing irrigation controller technology.',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      visitorName: 'Engro Fertilizers R&D Team',
      visitorOrg: 'Engro Fertilizers Ltd. - R&D and Agronomy Division',
      visitDate: new Date('2023-09-05'),
      agenda: 'MoU review and progress meeting. Joint bio-pesticide trials inspection at IPP Research Plot. Discussion of student internship placements and joint grant application (PSF Industry-Academia Programme).',
      departmentVisited: 'Institute of Plant Protection (IPP)',
      visitType: 'Industry',
      outcome: 'Bio-pesticide trial results presented; Engro confirmed intent to progress licensing agreement. Internship quota increased from 5 to 10 students/year. Joint PSF application finalised for submission.',
      staffId: kamranShah.id,
      verificationStatus: 'VERIFIED',
    },
    {
      visitorName: 'Punjab Food Authority Inspection Team',
      visitorOrg: 'Punjab Food Authority (PFA) - Technical Wing',
      visitDate: new Date('2024-03-12'),
      agenda: 'Assessment of MNSUAM food science laboratories for PFA-approved testing lab status. Review of analytical equipment and SOPs. Discussion of collaboration on food safety testing for local SMEs.',
      departmentVisited: 'Department of Food Science and Technology',
      visitType: 'Government',
      outcome: 'PFA preliminary approval granted. MNSUAM food lab to be listed as authorised testing facility by Q2 2024. MoU with PFA under preparation. Lab will generate income from third-party testing.',
      staffId: hinaAshraf.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // Events
  await prisma.event.deleteMany({});
  await prisma.event.createMany({ data: [
    {
      title: 'MNSUAM Innovation & Agri-Tech Expo 2024',
      eventDate: new Date('2024-03-18'),
      leadOrganizer: 'ORIC, MNSUAM',
      category: 'Innovation Fair',
      arrangedOrParticipated: 'Arranged',
      scope: 'NATIONAL',
      participants: 850,
      venue: 'MNSUAM Main Auditorium & Exhibition Grounds',
      subjectArea: 'Agricultural Technology, Food Innovation, Environmental Solutions, Digital Farming',
      outcome: '24 student and faculty innovation exhibits; 4 startups received SMEDA seed funding (total PKR 2.4M); 3 industry MoU extensions signed; 12 media appearances including Dawn, Geo, and ARY.',
      collaborationDeveloped: 'Strategic partnership with SMEDA for startup incubation. Engro Technology Excellence Award established (annual PKR 500,000 prize). PASHA AgriTech Hackathon partnership formalised.',
      sponsoringAgency: 'Higher Education Commission (HEC)',
      grantValue: 500000,
      financialSupport: 'HEC PKR 500,000; SMEDA PKR 300,000; Engro PKR 200,000',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'International Symposium on Climate-Smart Agriculture in South Asia',
      eventDate: new Date('2023-11-22'),
      leadOrganizer: 'Department of Agronomy, MNSUAM',
      category: 'Conference',
      arrangedOrParticipated: 'Arranged',
      scope: 'INTERNATIONAL',
      participants: 320,
      venue: 'MNSUAM Conference Hall and Research Farm',
      subjectArea: 'Climate Change Adaptation, Crop Improvement, Carbon Sequestration, Water Management',
      outcome: '45 research papers presented by researchers from 12 countries; proceedings accepted for publication in ISHS Acta Horticulturae; 2 new international joint projects initiated (USAID + WUR); post-symposium field day attended by 200 farmers.',
      collaborationDeveloped: 'MNSUAM-UAF-WUR tripartite research consortium formalised on climate soil health. USAID concept note for Climate-Smart Wheat program agreed.',
      sponsoringAgency: 'USDA / USAID, HEC Pakistan',
      financialSupport: 'USDA PKR 1.2M; HEC PKR 400,000; participants registration PKR 320,000',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Capacity Building Workshop on Intellectual Property Rights for Academic Researchers',
      eventDate: new Date('2024-04-05'),
      leadOrganizer: 'ORIC, MNSUAM in collaboration with IPO Pakistan',
      category: 'Workshop',
      arrangedOrParticipated: 'Arranged',
      scope: 'NATIONAL',
      participants: 120,
      venue: 'Faculty of Agriculture Seminar Hall, MNSUAM',
      subjectArea: 'Intellectual Property Law, Patent Filing Process, Technology Transfer, Commercialisation',
      outcome: '6 new patent disclosure forms submitted within 30 days; 3 consultancy agreements initiated; faculty IP awareness index improved from 2.1/5 to 3.8/5 (measured by pre/post survey).',
      collaborationDeveloped: 'MoU with IPO Pakistan for annual IP training programme. ORIC to host IPO regional IP awareness clinic quarterly.',
      sponsoringAgency: 'IPO Pakistan, HEC',
      financialSupport: 'HEC PKR 150,000; IPO Pakistan in-kind support (expert trainers)',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'National Seminar on Food Security and SDGs - Pakistan at 2030',
      eventDate: new Date('2023-09-14'),
      leadOrganizer: 'Faculty of Agriculture & Environmental Science, MNSUAM',
      category: 'Seminar',
      arrangedOrParticipated: 'Arranged',
      scope: 'NATIONAL',
      participants: 210,
      venue: 'MNSUAM Main Auditorium',
      subjectArea: 'Food Security, SDG 2, Agricultural Policy, Nutritional Security',
      outcome: 'Joint policy brief submitted to Ministry of National Food Security & Research (MNFSR); media coverage in Dawn, The News, Business Recorder; 3 actionable policy recommendations endorsed by MNFSR consultative committee.',
      sponsoringAgency: 'MNFSR, FAO Pakistan',
      financialSupport: 'FAO Pakistan PKR 200,000; MNSUAM institutional contribution',
      staffId: usmanFarooq.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'MNSUAM Annual PhD Research Colloquium 2024',
      eventDate: new Date('2024-05-08'),
      leadOrganizer: 'Graduate Studies Office, MNSUAM',
      category: 'Seminar',
      arrangedOrParticipated: 'Arranged',
      scope: 'NATIONAL',
      participants: 180,
      venue: 'MNSUAM Conference Hall',
      subjectArea: 'Agricultural Sciences, Plant Biotechnology, Environmental Sciences, Food Science',
      outcome: '38 PhD scholars presented their research. Best PhD Research Award won by Hifza Rana (Soil Sciences, supervised by Dr. Nazia Bibi). 5 papers recommended for publication in HEC-recognised journals.',
      staffId: naziaBibi.id,
      verificationStatus: 'VERIFIED',
    },
    {
      title: 'Farmer Field Day - UAV Technology Demonstration',
      eventDate: new Date('2024-02-28'),
      leadOrganizer: 'Dr. Umar Ejaz, MNSUAM',
      category: 'Workshop',
      arrangedOrParticipated: 'Arranged',
      scope: 'NATIONAL',
      participants: 350,
      venue: 'MNSUAM Research Farm, Multan',
      subjectArea: 'UAV Crop Monitoring, Precision Irrigation, Digital Agriculture Tools',
      outcome: 'Live UAV demonstration over 5 hectares. 350 farmers registered for mobile app beta programme. 12 agricultural extension officers trained. Covered by Punjab Agriculture Department newsletter.',
      collaborationDeveloped: 'Punjab Agriculture Department agreed to integrate AgriScan-UAV into 8 district extension centres as pilot.',
      sponsoringAgency: 'Punjab Agriculture Department',
      financialSupport: 'HEC NRPU project funds PKR 180,000',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // Policy Advocacy
  await prisma.policyAdvocacy.deleteMany({});
  await prisma.policyAdvocacy.createMany({ data: [
    {
      govtBody: 'Ministry of National Food Security & Research (MNFSR)',
      areaAdvocated: 'Agriculture',
      brief: 'Formal briefing to MNFSR on increasing HEC allocation for agricultural research from current 8% to 15% of total HEC budget, citing direct correlation between research investment and food security outcomes. Presented evidence from wheat and lentil breeding programs at MNSUAM demonstrating 12-45% yield improvements that would not have been possible without sustained funding.',
      coalitionPartners: 'University of Agriculture Faisalabad (UAF), AARI Faisalabad, Pakistan Agriculture Research Council (PARC), NARC Islamabad',
      advocacyTools: 'Written policy brief (12 pages), presentation at MNFSR National Consultation on Agricultural Research Policy, op-ed published in Dawn (5,000 word), participation in federal budget recommendations committee.',
      staffId: abdulQadir.id,
      verificationStatus: 'VERIFIED',
    },
    {
      govtBody: 'Punjab Environmental Protection Agency (Punjab EPA)',
      areaAdvocated: 'Environment',
      brief: 'Advocacy for stricter regulations on synthetic pesticide use in Punjab\'s cotton belt and promotion of mandatory IPM adoption. Presented scientific evidence of pesticide contamination in Chenab basin water bodies and recommendations for a graduated phase-out of Class I pesticides with substitution by registered biological alternatives.',
      coalitionPartners: 'WWF-Pakistan, Punjab Agriculture Department Plant Protection Wing, Greenman Initiative, Nature Pakistan',
      advocacyTools: 'Scientific environmental impact report (40 pages), facilitated a multi-stakeholder roundtable (120 participants), formal participation in Punjab EPA Advisory Committee on Agricultural Chemicals, media briefing to 8 journalists.',
      staffId: kamranShah.id,
      verificationStatus: 'VERIFIED',
    },
    {
      govtBody: 'Higher Education Commission of Pakistan (HEC)',
      areaAdvocated: 'Economic Development',
      brief: 'Comprehensive proposal to HEC for establishing a dedicated PKR 2 billion AgriTech Commercialisation Fund and streamlining IP licensing procedures for public universities. Current IP licensing cycle averages 18 months - proposal targets reduction to 6 months through dedicated IP officers at all agricultural universities.',
      coalitionPartners: 'NUST, COMSATS University, IBA Sukkur, Lahore University of Management Sciences (LUMS)',
      advocacyTools: 'Formal proposal document submitted to HEC Chairman, presentation at HEC National Technology Transfer Conference 2023, submission to HEC\'s National Research Agenda consultation process.',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
    {
      govtBody: 'Punjab Agriculture Department (PAD)',
      areaAdvocated: 'Agriculture',
      brief: 'Proposal for Punjab Agriculture Department to integrate UAV-based crop monitoring into district agricultural extension services. Pilot data from MNSUAM Research Farm shows UAV monitoring enables 30% faster identification of crop stress compared to ground-based scouting, allowing timely interventions that save 8-12% of yield.',
      coalitionPartners: 'Agricultural Extension Department Punjab, PASHA AgriTech Working Group, TechVentures Agriculture',
      advocacyTools: 'Technical demonstration at PAD headquarters, pilot programme proposal with budget, presentation to Secretary Agriculture Punjab, field demonstration at MNSUAM Research Farm (attended by Director General Extension).',
      staffId: umar.id,
      verificationStatus: 'VERIFIED',
    },
  ]});

  // Notifications
  await prisma.notification.deleteMany({ where: { recipientRole: 'ORIC' } });
  await prisma.notification.createMany({ data: [
    { type: 'PROJECT_SUBMITTED', title: 'New Project Proposal - Dr. Umar Ejaz', message: 'Dr. Umar Ejaz has submitted an international project proposal: "ICARDA-Funded Climate Adaptation of Lentil Germplasm". Budget: PKR 18.5M. Requires ORIC review.', link: '/oric-admin', recipientRole: 'ORIC', isRead: false },
    { type: 'PATENT_SUBMITTED', title: 'Patent Disclosure Filed - Dr. Umar Ejaz', message: 'New IP disclosure for "AgriScan-UAV Software" has been submitted. Please review and schedule IP committee evaluation.', link: '/oric-admin/ip-disclosures', recipientRole: 'ORIC', isRead: false },
    { type: 'CONSULTANCY_COMPLETED', title: 'Consultancy Completed - Punjab Agriculture Department', message: 'Soil Fertility Assessment project (PKR 2.5M) marked as completed. ORIC overhead of PKR 250,000 due for collection.', link: '/oric-admin/consultancies', recipientRole: 'ORIC', isRead: false },
    { type: 'MOU_RENEWAL', title: 'MoU Renewal Due - UAF', message: 'MoU with University of Agriculture Faisalabad expires in 90 days (March 2025). Initiate renewal process.', link: '/oric-admin/mous', recipientRole: 'ORIC', isRead: true },
    { type: 'INSTALLMENT_DUE', title: 'Installment Due - UAV Precision Monitoring Project', message: 'Installment #2 (PKR 4M) for HEC NRPU project "UAV-Based Precision Crop Monitoring" is due on Feb 1, 2025.', link: '/oric-admin', recipientRole: 'ORIC', isRead: true },
  ]});

  console.log('\n✅ Database seeded successfully!');
  console.log('\n🔑 CREDENTIALS:');
  console.log('   admin@mnsuam.edu.pk  / Admin@2024!Secure  (ADMIN)');
  console.log('   oric@mnsuam.edu.pk   / Admin@2024!Secure  (ORIC)');
  console.log('   umar@mnsuam.edu.pk   / Admin@2024!Secure  (FACULTY - primary test user)');
  console.log('   abdul.qadir@mnsuam.edu.pk   / Faculty@123');
  console.log('   nazia.bibi@mnsuam.edu.pk    / Faculty@123');
  console.log('   zainab.malik@mnsuam.edu.pk  / Faculty@123');
  console.log('   kamran.shah@mnsuam.edu.pk   / Faculty@123');
  console.log('   hina.ashraf@mnsuam.edu.pk   / Faculty@123');
  console.log('   usman.farooq@mnsuam.edu.pk  / Faculty@123');
  console.log('   fatima.zahra@mnsuam.edu.pk  / Faculty@123');
  console.log('   asad.ali@mnsuam.edu.pk      / Faculty@123');
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
