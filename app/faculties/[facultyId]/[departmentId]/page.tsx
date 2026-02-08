'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BarChart from '@/components/charts/BarChart';

interface Staff {
  id: string;
  name: string;
  email: string;
  designation: string;
  bio: string | null;
  experienceYears: string | null;
  profileImage: string | null;
  qualifications: string | null;
  specialization: string | null;
  studentsSupervised: number;
  totalPublications: number;
  totalProjects: number;
  totalCourses: number;
}

interface Program {
  id: string;
  name: string;
}

interface ResearchArea {
  id: string;
  name: string;
}

interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  establishedYear: number;
  totalStudents: number;
  description: string | null;
  faculty: Faculty;
  staff: Staff[];
  programs: Program[];
  researchAreas: ResearchArea[];
  totalStaff: number;
  totalPrograms: number;
  totalResearchAreas: number;
  totalPublications: number;
  totalProjects: number;
}

interface PageProps {
  params: Promise<{
    facultyId: string;
    departmentId: string;
  }>;
}

/**
 * Department Detail Page
 *
 * Shows comprehensive information about a specific department including:
 * - Department overview and statistics
 * - Programs offered
 * - Research areas
 * - Staff members with their details
 */
export default function DepartmentPage({ params }: PageProps) {
  const { facultyId, departmentId } = use(params);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDepartment() {
      try {
        const res = await fetch(`/api/faculties/${facultyId}/departments/${departmentId}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error(data.error || 'Failed to fetch department');
        }

        setDepartment(data.department);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDepartment();
  }, [facultyId, departmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Loading department details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800">{error || 'Department not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  // Prepare chart data for staff publications and projects
  const staffPublicationsData = {
    categories: department.staff.map(s => s.name.split(' ').slice(-1)[0] || s.name.substring(0, 10)),
    values: department.staff.map(s => s.totalPublications)
  };

  const staffProjectsData = {
    categories: department.staff.map(s => s.name.split(' ').slice(-1)[0] || s.name.substring(0, 10)),
    values: department.staff.map(s => s.totalProjects)
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb and Search */}
        <div className="mb-6 flex items-center justify-between gap-6">
          <div className="text-sm text-[#666666]">
            <Link href="/faculties" className="hover:text-[#2d6a4f]">
              Faculties
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/faculties/${facultyId}`} className="hover:text-[#2d6a4f]">
              {department.faculty.shortName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#1a1a1a]">{department.name}</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchBar placeholder="Search staff members or programs..." />
          </div>
        </div>

        {/* Department Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e5e5] mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-[#e8f5e9] rounded-xl flex items-center justify-center text-[#2d6a4f] font-bold text-xl">
                  {department.name.split(' ').slice(-1)[0].substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                    {department.name}
                  </h1>
                  <p className="text-sm text-[#666666] mt-1">
                    {department.faculty.name}
                  </p>
                </div>
              </div>
              {department.description && (
                <p className="text-sm text-[#666666] max-w-3xl">
                  {department.description}
                </p>
              )}
            </div>
            <span className="text-xs font-semibold bg-[#f5f5f5] text-[#666666] px-3 py-1 rounded-full whitespace-nowrap ml-4">
              Est. {department.establishedYear}
            </span>
          </div>

          {/* Head Info */}
          <div className="mb-6 pb-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center text-[#2d6a4f] font-bold">
                {department.head.split(' ')[1]?.charAt(0) || 'H'}
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Head of Department</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {department.head}
                </p>
              </div>
            </div>
          </div>

          {/* Department Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#f3e5f5] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#7b1fa2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{department.totalStudents}</p>
              <p className="text-sm text-[#666666]">Students</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#fff3e0] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#e65100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{department.totalStaff}</p>
              <p className="text-sm text-[#666666]">Staff</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#fce4ec] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#c2185b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{department.totalPublications}</p>
              <p className="text-sm text-[#666666]">Publications</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e0f2f1] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#00897b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{department.totalProjects}</p>
              <p className="text-sm text-[#666666]">Projects</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e3f2fd] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#1976d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{department.totalPrograms}</p>
              <p className="text-sm text-[#666666]">Programs</p>
            </div>
          </div>
        </div>

        {/* Programs & Research Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Programs Offered</h2>
            {department.programs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {department.programs.map((program) => (
                  <span
                    key={program.id}
                    className="text-sm bg-[#f5f5f5] text-[#666666] px-4 py-2 rounded-full border border-[#e5e5e5]"
                  >
                    {program.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#666666]">No programs listed</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Research Areas</h2>
            {department.researchAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {department.researchAreas.map((area) => (
                  <span
                    key={area.id}
                    className="text-sm bg-[#e8f5e9] text-[#2d6a4f] px-4 py-2 rounded-full border border-[#2d6a4f]/20"
                  >
                    {area.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#666666]">No research areas listed</p>
            )}
          </div>
        </div>

        {/* Analytics */}
        {department.staff.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
              Staff Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Publications by Staff</h3>
                <BarChart data={staffPublicationsData} color="#c2185b" />
              </div>
              <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Projects by Staff</h3>
                <BarChart data={staffProjectsData} color="#00897b" />
              </div>
            </div>
          </section>
        )}

        {/* Staff Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
            Faculty Members
          </h2>

          {department.staff.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-[#e5e5e5] text-center">
              <p className="text-[#666666]">No staff members listed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {department.staff.map((staff) => (
                <Link
                  key={staff.id}
                  href={`/faculty/${staff.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-[#e5e5e5] h-full group-hover:border-[#2d6a4f]">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#e8f5e9] rounded-full flex items-center justify-center text-[#2d6a4f] font-bold flex-shrink-0">
                        {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#1a1a1a] group-hover:text-[#2d6a4f] transition-colors truncate">
                          {staff.name}
                        </h3>
                        <p className="text-sm text-[#666666]">{staff.designation}</p>
                      </div>
                    </div>

                    {staff.specialization && (
                      <p className="text-sm text-[#666666] mb-4 line-clamp-2">
                        {staff.specialization}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-[#f5f5f5] rounded-lg">
                        <p className="text-xs text-[#666666] mb-1">Pubs</p>
                        <p className="text-lg font-bold text-[#c2185b]">{staff.totalPublications}</p>
                      </div>
                      <div className="text-center p-2 bg-[#f5f5f5] rounded-lg">
                        <p className="text-xs text-[#666666] mb-1">Projects</p>
                        <p className="text-lg font-bold text-[#00897b]">{staff.totalProjects}</p>
                      </div>
                      <div className="text-center p-2 bg-[#f5f5f5] rounded-lg">
                        <p className="text-xs text-[#666666] mb-1">Students</p>
                        <p className="text-lg font-bold text-[#1976d2]">{staff.studentsSupervised}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
