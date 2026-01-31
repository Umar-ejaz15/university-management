'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';

interface Department {
  id: string;
  name: string;
  head: string;
  establishedYear: number;
  totalStudents: number;
  totalStaff: number;
  totalPublications: number;
  totalProjects: number;
  description: string | null;
}

interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  description: string | null;
  totalDepartments: number;
  totalStudents: number;
  totalStaff: number;
  totalPublications: number;
  totalProjects: number;
  departments: Department[];
}

interface PageProps {
  params: Promise<{
    facultyId: string;
  }>;
}

/**
 * Faculty Detail Page
 *
 * Shows information about a specific faculty and lists all its departments
 * Displays faculty stats and provides links to individual department pages
 */
export default function FacultyDetailPage({ params }: PageProps) {
  const { facultyId } = use(params);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const res = await fetch('/api/faculties-list');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch faculty');
        }

        const foundFaculty = data.faculties.find((f: Faculty) => f.id === facultyId);

        if (!foundFaculty) {
          notFound();
        }

        setFaculty(foundFaculty);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFaculty();
  }, [facultyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Loading faculty details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800">{error || 'Faculty not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  // Prepare chart data
  const departmentStudentsData = {
    categories: faculty.departments.map(d => d.name.replace('Department of ', '')),
    values: faculty.departments.map(d => d.totalStudents)
  };

  const departmentStaffData = {
    categories: faculty.departments.map(d => d.name.replace('Department of ', '')),
    values: faculty.departments.map(d => d.totalStaff)
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-[#666666]">
          <Link href="/faculties" className="hover:text-[#4169E1]">
            Faculties
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1a1a1a]">{faculty.shortName}</span>
        </div>

        {/* Faculty Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e5e5] mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#e8f5e9] rounded-xl flex items-center justify-center text-[#2d6a4f] font-bold text-2xl">
                {faculty.shortName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 tracking-tight">
                  {faculty.name}
                </h1>
                <p className="text-sm text-[#666666] max-w-3xl">
                  {faculty.description}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-[#f5f5f5] text-[#666666] px-3 py-1 rounded-full whitespace-nowrap">
              Est. {faculty.establishedYear}
            </span>
          </div>

          {/* Dean Info */}
          <div className="mb-6 pb-6 border-b border-[#e5e5e5]">
            <p className="text-xs text-[#666666] mb-1">Dean</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {faculty.dean}
            </p>
          </div>

          {/* Faculty Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e8f5e9] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#2d6a4f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{faculty.totalDepartments}</p>
              <p className="text-sm text-[#666666]">Departments</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#f3e5f5] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#7b1fa2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{faculty.totalStudents.toLocaleString()}</p>
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
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{faculty.totalStaff}</p>
              <p className="text-sm text-[#666666]">Faculty Staff</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#fce4ec] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#c2185b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{faculty.totalPublications.toLocaleString()}</p>
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
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{faculty.totalProjects}</p>
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
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{faculty.departments.length}</p>
              <p className="text-sm text-[#666666]">Depts</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
            Department Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Students by Department</h3>
              <BarChart data={departmentStudentsData} color="#2d6a4f" />
            </div>
            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Staff by Department</h3>
              <BarChart data={departmentStaffData} color="#1976d2" />
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
            All Departments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculty.departments.map((department) => (
              <Link
                key={department.id}
                href={`/faculties/${facultyId}/${department.id}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-[#e5e5e5] h-full group-hover:border-[#2d6a4f]">
                  {/* Department Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#2d6a4f] transition-colors">
                      {department.name}
                    </h3>
                    {department.description && (
                      <p className="text-sm text-[#666666] line-clamp-2">
                        {department.description}
                      </p>
                    )}
                  </div>

                  {/* Department Head */}
                  <div className="mb-4 pb-4 border-b border-[#e5e5e5]">
                    <p className="text-xs text-[#666666] mb-1">Head of Department</p>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      {department.head}
                    </p>
                  </div>

                  {/* Department Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                      <p className="text-xs text-[#666666] mb-1">Students</p>
                      <p className="text-lg font-bold text-[#1976d2]">
                        {department.totalStudents}
                      </p>
                    </div>
                    <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                      <p className="text-xs text-[#666666] mb-1">Staff</p>
                      <p className="text-lg font-bold text-[#e65100]">
                        {department.totalStaff}
                      </p>
                    </div>
                    <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                      <p className="text-xs text-[#666666] mb-1">Pubs</p>
                      <p className="text-lg font-bold text-[#c2185b]">
                        {department.totalPublications}
                      </p>
                    </div>
                    <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                      <p className="text-xs text-[#666666] mb-1">Projects</p>
                      <p className="text-lg font-bold text-[#00897b]">
                        {department.totalProjects}
                      </p>
                    </div>
                  </div>

                  {/* View More */}
                  <div className="pt-4 border-t border-[#e5e5e5]">
                    <span className="text-sm text-[#2d6a4f] font-semibold group-hover:text-[#1e4d39] flex items-center gap-2">
                      View Department Details
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
