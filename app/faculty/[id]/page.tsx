import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ProfileHeader from '@/components/faculty/ProfileHeader';
import FacultyDetails from '@/components/faculty/FacultyDetails';
import PageFooter from '@/components/layout/PageFooter';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Faculty Detail Page
 *
 * Shows comprehensive information about a specific faculty member including:
 * - Personal info and photo
 * - Publication history over time
 * - Current teaching assignments
 *
 * If the faculty ID doesn't exist, shows a 404 error page
 */
export default async function FacultyPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Fetch staff member from database
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      department: {
        include: {
          faculty: true,
        },
      },
      publications: {
        orderBy: { year: 'desc' },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      courses: {
        orderBy: { name: 'asc' },
      },
    },
  });

  // Show 404 if faculty member doesn't exist
  if (!staff) {
    notFound();
  }

  // Check if the current user is viewing their own profile
  let isOwnProfile = false;
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });
    isOwnProfile = dbUser?.staffId === id;
  }

  // Calculate publications history for the chart (last 6 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);
  const publicationsHistory = {
    years: years.map(String),
    values: years.map(
      (year) => staff.publications.filter((pub) => pub.year === year).length
    ),
  };

  // Format teaching load for the table
  const teachingLoad = staff.courses.map((course) => ({
    course: course.name,
    credits: String(course.credits),
    students: String(course.students),
  }));

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <ProfileHeader
          name={staff.name}
          designation={staff.designation}
          department={staff.department.name}
          publications={staff.publications.length}
          projects={staff.projects.length}
          students={staff.studentsSupervised}
          profileImage={staff.profileImage}
          isOwnProfile={isOwnProfile}
        />

        <FacultyDetails
          publicationsHistory={publicationsHistory}
          teachingLoad={teachingLoad}
        />

        <PageFooter />
      </main>
    </div>
  );
}
