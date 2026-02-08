import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function verify() {
  const programCount = await prisma.program.count();
  const departmentCount = await prisma.department.count();
  const facultyCount = await prisma.faculty.count();
  const staffCount = await prisma.staff.count();

  console.log('\n✅ Database Verification:\n');
  console.log(`📚 Programs created: ${programCount}`);
  console.log(`🏛️  Departments: ${departmentCount}`);
  console.log(`🎓 Faculties: ${facultyCount}`);
  console.log(`👥 Staff members: ${staffCount}`);

  // Show some sample programs
  const samplePrograms = await prisma.program.findMany({
    take: 5,
    include: {
      department: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log('\n📋 Sample Programs:');
  samplePrograms.forEach((program) => {
    console.log(`   - ${program.name} (${program.department.name})`);
  });

  await prisma.$disconnect();
}

verify();
