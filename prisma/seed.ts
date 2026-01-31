import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hashPassword } from '../lib/auth';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Seeding database...');

  // =================================================================
  // CREATE ADMIN ACCOUNT
  // =================================================================
  // IMPORTANT: Replace these values with your actual admin credentials
  // Email: Use your university email address
  // Password: Use a strong password (min 8 chars, uppercase, lowercase, number)
  // Name: Your full name
  // =================================================================

  const ADMIN_EMAIL = 'admin@mnsuam.edu.pk';
  const ADMIN_PASSWORD = 'Admin@2024!Secure';
  const ADMIN_NAME = 'System Administrator';

  console.log('\n📋 Checking for admin account...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('✓ Admin account already exists');
    console.log(`  Email: ${existingAdmin.email}`);
  } else {
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingUser) {
      console.log(`⚠️  Email ${ADMIN_EMAIL} already exists with role: ${existingUser.role}`);
    } else {
      console.log('🔐 Creating admin account...');
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);

      const admin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          name: ADMIN_NAME,
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Admin account created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   ID: ${admin.id}`);
    }
  }

  console.log('\n📋 Seeding faculties and departments...');

  // Create faculties
  const socialSciences = await prisma.faculty.upsert({
    where: { shortName: 'SS' },
    update: {},
    create: {
      name: 'Faculty of Social Sciences',
      shortName: 'SS',
      dean: 'Dr. Sarah Johnson',
      establishedYear: 1950,
      description: 'Dedicated to understanding human behavior and society',
    },
  });

  const engineering = await prisma.faculty.upsert({
    where: { shortName: 'ENG' },
    update: {},
    create: {
      name: 'Faculty of Engineering',
      shortName: 'ENG',
      dean: 'Dr. Michael Chen',
      establishedYear: 1965,
      description: 'Advancing technology and innovation',
    },
  });

  const naturalSciences = await prisma.faculty.upsert({
    where: { shortName: 'NS' },
    update: {},
    create: {
      name: 'Faculty of Natural Sciences',
      shortName: 'NS',
      dean: 'Dr. Emily Rodriguez',
      establishedYear: 1955,
      description: 'Exploring the fundamental laws of nature',
    },
  });

  // Create departments
  await prisma.department.upsert({
    where: { id: 'cs-dept' },
    update: {},
    create: {
      id: 'cs-dept',
      name: 'Computer Science',
      head: 'Dr. Aamir Hussain',
      establishedYear: 1980,
      description: 'Department of Computer Science and Software Engineering',
      facultyId: engineering.id,
    },
  });

  await prisma.department.upsert({
    where: { id: 'psychology-dept' },
    update: {},
    create: {
      id: 'psychology-dept',
      name: 'Psychology',
      head: 'Dr. Lisa Wang',
      establishedYear: 1970,
      description: 'Department of Psychology and Behavioral Sciences',
      facultyId: socialSciences.id,
    },
  });

  await prisma.department.upsert({
    where: { id: 'biology-dept' },
    update: {},
    create: {
      id: 'biology-dept',
      name: 'Biology',
      head: 'Dr. Robert Kim',
      establishedYear: 1960,
      description: 'Department of Biological Sciences',
      facultyId: naturalSciences.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
  