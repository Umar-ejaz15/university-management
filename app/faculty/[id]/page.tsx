import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ProfileHeader from '@/components/faculty/ProfileHeader';
import FacultyDetails from '@/components/faculty/FacultyDetails';
import PageFooter from '@/components/layout/PageFooter';
import { getFacultyById } from '@/lib/faculty-data';

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
  const faculty = getFacultyById(id);

  // Show 404 if faculty member doesn't exist
  if (!faculty) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <ProfileHeader
          name={faculty.name}
          designation={faculty.designation}
          department={faculty.department}
          publications={faculty.publications}
          projects={faculty.projects}
          students={faculty.students}
        />

        <FacultyDetails
          publicationsHistory={faculty.publicationsHistory}
          teachingLoad={faculty.teachingLoad}
        />

        <PageFooter />
      </main>
    </div>
  );
}
