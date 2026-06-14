import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hashPassword } from '../lib/auth';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('🌱 Seeding ORIC admin and ORIC data...');

  // =================================================================
  // ORIC ADMIN USER
  // =================================================================

  const ORIC_EMAIL = 'oric@mnsuam.edu.pk';
  const ORIC_PASSWORD = 'Admin@2024!Secure';
  const hashedPassword = await hashPassword(ORIC_PASSWORD);

  const oricAdmin = await prisma.user.upsert({
    where: { email: ORIC_EMAIL },
    update: {},
    create: {
      email: ORIC_EMAIL,
      password: hashedPassword,
      name: 'ORIC Administrator',
      role: 'ORIC',
      isActive: true,
    },
  });

  console.log(`✅ ORIC admin: ${oricAdmin.email}`);

  // =================================================================
  // ORIC DATA — attach to first 6 staff members
  // =================================================================

  const staffForOric = await prisma.staff.findMany({
    take: 6,
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });

  if (staffForOric.length === 0) {
    console.log('⚠️  No staff found — run main seed first');
    return;
  }

  const s0 = staffForOric[0].id;
  const s1 = (staffForOric[1] ?? staffForOric[0]).id;
  const s2 = (staffForOric[2] ?? staffForOric[0]).id;
  const s3 = (staffForOric[3] ?? staffForOric[0]).id;
  const s4 = (staffForOric[4] ?? staffForOric[0]).id;

  // Skip if already seeded (idempotent check)
  const existingPatents = await prisma.patent.count({ where: { staffId: s0 } });
  if (existingPatents > 0) {
    console.log('ℹ️  ORIC records already exist for this staff — skipping data seed');
  } else {
    // Patents
    await prisma.patent.createMany({
      data: [
        {
          title: 'Drought-Tolerant Wheat Cultivar "MNSU-Gold"',
          leadInventor: staffForOric[0].name,
          designation: 'Professor',
          department: 'Department of Agronomy',
          ipCategory: 'Variety/Cultivar',
          developmentStatus: 'Production Ready',
          keyAspects: 'Novel wheat variety with 40% better yield under drought stress, suitable for arid regions of Punjab',
          commercialPartner: 'Punjab Seed Corporation',
          financialSupport: 'HEC NRPU Grant',
          filedWith: 'FSC&RD',
          scope: 'NATIONAL',
          filingDate: new Date('2023-06-15'),
          applicationNumber: 'FSC-2023-0456',
          patentStatus: 'Under Examination',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Bio-Pesticide Formulation from Neem Extract',
          leadInventor: staffForOric[1]?.name ?? staffForOric[0].name,
          designation: 'Associate Professor',
          department: 'Institute of Plant Protection (IPP)',
          ipCategory: 'Process',
          developmentStatus: 'Validation',
          keyAspects: 'Eco-friendly biopesticide effective against cotton bollworm, reduces chemical pesticide use by 70%',
          commercialPartner: 'Engro Fertilizers',
          financialSupport: 'PSF Research Grant',
          filedWith: 'IPO Pakistan',
          scope: 'NATIONAL',
          filingDate: new Date('2023-09-20'),
          applicationNumber: 'IPO-2023-12345',
          patentStatus: 'Filed',
          staffId: s1,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Solar-Powered Precision Irrigation Controller',
          leadInventor: staffForOric[2]?.name ?? staffForOric[0].name,
          designation: 'Assistant Professor',
          department: 'Department of Agricultural Engineering',
          ipCategory: 'Technology',
          developmentStatus: 'Prototype',
          keyAspects: 'IoT-enabled low-cost solar irrigation controller with soil moisture sensing, reduces water use by 35%',
          filedWith: 'IPO Pakistan',
          scope: 'NATIONAL',
          filingDate: new Date('2024-01-10'),
          applicationNumber: 'IPO-2024-00231',
          patentStatus: 'Filed',
          staffId: s2,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    // IP Disclosures
    await prisma.iPDisclosure.createMany({
      data: [
        {
          title: 'High-Yield Rice Variety Resistant to Blast Disease',
          leadInventor: staffForOric[0].name,
          designation: 'Professor',
          department: 'Institute of Plant Breeding and Biotechnology',
          ipCategory: 'Variety/Cultivar',
          developmentStatus: 'Production Ready',
          scope: 'NATIONAL',
          keyAspects: 'New rice variety with built-in resistance to Magnaporthe oryzae; yield increase of 25% under disease pressure',
          commercialPartner: 'Rice Research Institute Kala Shah Kaku',
          financialSupport: 'PARC Grant',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Biofortified Maize for Zinc Deficiency',
          leadInventor: staffForOric[3]?.name ?? staffForOric[0].name,
          designation: 'Associate Professor',
          department: 'Department of Agronomy',
          ipCategory: 'Variety/Cultivar',
          developmentStatus: 'Validation',
          scope: 'NATIONAL',
          keyAspects: 'Biofortified maize with 2x higher zinc content; targets rural malnutrition with no agronomic penalty',
          financialSupport: 'HarvestPlus / CGIAR',
          staffId: s3,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    // Consultancies
    await prisma.consultancy.createMany({
      data: [
        {
          title: 'Soil Fertility Assessment — Pakpattan District',
          clientName: 'Punjab Agriculture Department',
          clientCountry: 'Pakistan',
          serviceType: 'Feasibility Study',
          deliverables: 'District-level soil fertility maps, fertilizer recommendations, training workshops',
          contractValue: 2500000,
          oricOverheadPercent: 10,
          oricOverheadAmount: 250000,
          startDate: new Date('2023-07-01'),
          endDate: new Date('2024-06-30'),
          status: 'Ongoing',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Crop Protection Strategy for Cotton Belt',
          clientName: 'Adamjee Agri Group',
          clientCountry: 'Pakistan',
          serviceType: 'Technical Advisory',
          deliverables: 'Integrated pest management plan, advisory visits, final report',
          contractValue: 1800000,
          oricOverheadPercent: 10,
          oricOverheadAmount: 180000,
          startDate: new Date('2023-10-15'),
          endDate: new Date('2024-04-30'),
          status: 'Completed',
          staffId: s1,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Water Quality Testing — Thal Irrigation Canal',
          clientName: 'Punjab Irrigation Department',
          clientCountry: 'Pakistan',
          serviceType: 'Testing & Analysis',
          deliverables: 'Water quality reports, contamination analysis, remediation proposals',
          contractValue: 1200000,
          oricOverheadPercent: 10,
          oricOverheadAmount: 120000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-07-31'),
          status: 'Ongoing',
          staffId: s2,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Nutrition Program Design for Rural Schools',
          clientName: 'UNICEF Pakistan',
          clientCountry: 'Pakistan',
          serviceType: 'Technical Advisory',
          deliverables: 'Nutritional assessment, school meal program design, impact evaluation framework',
          contractValue: 3400000,
          oricOverheadPercent: 10,
          oricOverheadAmount: 340000,
          startDate: new Date('2023-04-01'),
          endDate: new Date('2024-03-31'),
          status: 'Completed',
          staffId: s4,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    // MoUs
    await prisma.mou.createMany({
      data: [
        {
          partyName: 'University of Agriculture Faisalabad',
          linkageType: 'Research',
          partyType: 'Academia',
          establishmentDate: new Date('2022-03-10'),
          scope: 'NATIONAL',
          country: 'Pakistan',
          duration: '3 years',
          status: 'Active',
          focalPersonMnsuam: 'Director ORIC',
          focalPersonOther: 'Director Research',
          scopeOfCollaboration: 'Joint research projects in crop sciences, seed technology, and climate-smart agriculture',
          activities: 'Biannual joint seminars, graduate student exchanges, joint grant applications',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          partyName: 'CIMMYT (International Maize and Wheat Improvement Center)',
          linkageType: 'Research',
          partyType: 'Government',
          establishmentDate: new Date('2021-09-01'),
          scope: 'INTERNATIONAL',
          country: 'Mexico',
          duration: '5 years',
          status: 'Active',
          focalPersonMnsuam: 'Prof. Abdul Qadir',
          focalPersonOther: 'Dr. B. Govaerts',
          scopeOfCollaboration: 'Climate-resilient crop breeding, seed systems, and food security research',
          activities: 'Joint breeding trials, researcher visits, shared germplasm access',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          partyName: 'Engro Fertilizers Ltd.',
          linkageType: 'Academic',
          partyType: 'Industry',
          establishmentDate: new Date('2023-01-15'),
          scope: 'NATIONAL',
          country: 'Pakistan',
          duration: '2 years',
          status: 'Active',
          focalPersonMnsuam: 'Director ORIC',
          focalPersonOther: 'Head of R&D, Engro Fertilizers',
          scopeOfCollaboration: 'Applied research on fertilizer efficacy, student internships, technology transfer',
          staffId: s1,
          verificationStatus: 'VERIFIED',
        },
        {
          partyName: 'Wageningen University & Research',
          linkageType: 'Research',
          partyType: 'Academia',
          establishmentDate: new Date('2020-06-20'),
          scope: 'INTERNATIONAL',
          country: 'Netherlands',
          duration: '5 years',
          status: 'Active',
          focalPersonMnsuam: 'Dr. Nazia Bibi',
          focalPersonOther: 'Prof. L. Brussaard',
          scopeOfCollaboration: 'Soil health research, sustainable land management, and PhD co-supervision',
          staffId: s2,
          verificationStatus: 'VERIFIED',
        },
        {
          partyName: 'Punjab Agriculture Research Board (PARB)',
          linkageType: 'Research',
          partyType: 'Government',
          establishmentDate: new Date('2022-11-01'),
          scope: 'NATIONAL',
          country: 'Pakistan',
          duration: '3 years',
          status: 'Active',
          focalPersonMnsuam: 'Director ORIC',
          focalPersonOther: 'Chairman PARB',
          scopeOfCollaboration: 'Collaborative research grants, technology dissemination, extension services',
          staffId: s3,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    // Industrial Visits
    await prisma.industrialVisit.createMany({
      data: [
        {
          visitorName: 'Delegation from Fauji Fertilizer Company',
          visitorOrg: 'Fauji Fertilizer Company — R&D Division',
          visitDate: new Date('2024-02-14'),
          agenda: 'Explore collaboration on precision fertilization research and student internship program',
          departmentVisited: 'Department of Agronomy',
          visitType: 'Industry',
          outcome: 'MoU initiated; 5 student internship slots confirmed for summer 2024',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          visitorName: 'Representatives from USAID AgriLinks',
          visitorOrg: 'USAID — AgriLinks Program',
          visitDate: new Date('2023-11-08'),
          agenda: "Review MNSUAM's agricultural research portfolio and identify funding opportunities",
          departmentVisited: 'ORIC',
          visitType: 'Government',
          outcome: 'Letter of interest submitted for Climate-Smart Agriculture grant; follow-up meeting scheduled',
          staffId: s1,
          verificationStatus: 'VERIFIED',
        },
        {
          visitorName: 'Tech Delegation — PASHA ICT Summit',
          visitorOrg: 'Pakistan Software Houses Association (PASHA)',
          visitDate: new Date('2024-01-22'),
          agenda: 'Discuss tech transfer, student recruitment pipeline, and joint hackathon for AgriTech solutions',
          departmentVisited: 'Department of Agricultural Engineering',
          visitType: 'Industry',
          outcome: 'Annual AgriTech hackathon partnership agreed; 3 companies to offer graduate employment',
          staffId: s2,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    // Events
    await prisma.event.createMany({
      data: [
        {
          title: 'MNSUAM Innovation & Agri-Tech Expo 2024',
          eventDate: new Date('2024-03-18'),
          leadOrganizer: 'ORIC',
          category: 'Innovation Fair',
          arrangedOrParticipated: 'Arranged',
          scope: 'NATIONAL',
          participants: 850,
          venue: 'MNSUAM Main Auditorium & Exhibition Ground',
          subjectArea: 'Agricultural Technology, Food Innovation, Environmental Solutions',
          outcome: '12 student startup pitches; 4 received seed funding; 3 industry collaboration agreements signed',
          sponsoringAgency: 'Higher Education Commission (HEC)',
          grantValue: 500000,
          financialSupport: 'HEC',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'International Symposium on Climate-Smart Agriculture',
          eventDate: new Date('2023-11-22'),
          leadOrganizer: 'Department of Agronomy',
          category: 'Conference',
          arrangedOrParticipated: 'Arranged',
          scope: 'INTERNATIONAL',
          participants: 320,
          venue: 'MNSUAM Conference Hall',
          subjectArea: 'Climate Change, Crop Adaptation, Carbon Sequestration',
          outcome: '45 research papers presented; 2 joint projects initiated',
          sponsoringAgency: 'USDA / USAID',
          financialSupport: 'USDA',
          staffId: s1,
          verificationStatus: 'VERIFIED',
        },
        {
          title: 'Workshop on IP Rights for Researchers',
          eventDate: new Date('2024-04-05'),
          leadOrganizer: 'ORIC',
          category: 'Workshop',
          arrangedOrParticipated: 'Arranged',
          scope: 'NATIONAL',
          participants: 120,
          venue: 'Faculty of Agriculture, Seminar Hall',
          subjectArea: 'Intellectual Property, Patent Filing, Technology Transfer',
          outcome: '6 new patent disclosure forms submitted within one month',
          staffId: s2,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    // Policy Advocacy
    await prisma.policyAdvocacy.createMany({
      data: [
        {
          govtBody: 'Ministry of National Food Security & Research',
          areaAdvocated: 'Agriculture',
          brief: 'Briefing on increasing HEC allocation for agricultural research and the role of research universities in achieving SDG 2 targets for Pakistan',
          coalitionPartners: 'UAF, AARI, PARC',
          advocacyTools: 'Written policy brief, presentation at Ministry consultation meeting, media op-ed',
          staffId: s0,
          verificationStatus: 'VERIFIED',
        },
        {
          govtBody: 'Punjab Environmental Protection Agency',
          areaAdvocated: 'Environment',
          brief: "Advocacy for stricter regulations on agrochemical use and promotion of integrated pest management in Punjab's cotton belt",
          coalitionPartners: 'WWF-Pakistan, Punjab Agriculture Department',
          advocacyTools: 'Environmental impact report, stakeholder roundtable, participation in EPA advisory committee',
          staffId: s1,
          verificationStatus: 'VERIFIED',
        },
        {
          govtBody: 'Higher Education Commission of Pakistan',
          areaAdvocated: 'Economic Development',
          brief: 'Proposal for HEC to establish a dedicated AgriTech commercialization fund and streamline IP licensing for public universities',
          coalitionPartners: 'NUST, COMSATS, IBA Sukkur',
          advocacyTools: 'Formal proposal document, HEC national consultation presentation',
          staffId: s2,
          verificationStatus: 'VERIFIED',
        },
      ],
    });

    console.log('✅ ORIC records seeded: Patents, IP Disclosures, Consultancies, MoUs, Industrial Visits, Events, Policy Advocacy');
  }

  // ORIC Notifications (always upsert via create — OK since notifications are unique by content)
  const existingOricNotif = await prisma.notification.count({ where: { recipientRole: 'ORIC' } });
  if (existingOricNotif === 0) {
    await prisma.notification.createMany({
      data: [
        {
          type: 'PATENT_SUBMITTED',
          title: 'New Patent Disclosure Filed',
          message: 'A new patent disclosure has been submitted for "Drought-Tolerant Wheat Cultivar MNSU-Gold".',
          link: '/oric-admin',
          recipientRole: 'ORIC',
          isRead: false,
        },
        {
          type: 'CONSULTANCY_SUBMITTED',
          title: 'New Consultancy Request',
          message: 'Faculty has submitted a new consultancy agreement for review — Soil Fertility Assessment, Pakpattan.',
          link: '/oric-admin',
          recipientRole: 'ORIC',
          isRead: false,
        },
        {
          type: 'MOU_SUBMITTED',
          title: 'MoU Pending Review',
          message: 'New MoU with Engro Fertilizers Ltd. has been submitted and requires ORIC approval.',
          link: '/oric-admin',
          recipientRole: 'ORIC',
          isRead: false,
        },
      ],
    });
    console.log('✅ ORIC notifications seeded');
  }

  console.log('\n🔑 ORIC LOGIN:');
  console.log('   Email:    oric@mnsuam.edu.pk');
  console.log('   Password: Admin@2024!Secure');
  console.log('   Panel:    /oric-admin');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
