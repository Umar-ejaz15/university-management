import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Seeding database...');

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