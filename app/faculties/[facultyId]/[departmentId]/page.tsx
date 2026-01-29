'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import { getDepartmentById, getFacultyById } from '@/lib/department-data';

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
  const faculty = getFacultyById(facultyId);
  const department = getDepartmentById(facultyId, departmentId);

  if (!faculty || !department) {
    notFound();
  }

  // Prepare chart data for staff publications and projects
  const staffPublicationsData = {
    categories: department.staff.map(s => s.name.split(' ').slice(-1)[0]),
    values: department.staff.map(s => s.publications)
  };

  const staffProjectsData = {
    categories: department.staff.map(s => s.name.split(' ').slice(-1)[0]),
    values: department.staff.map(s => s.projects)
  };

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-[#666666]">
          <Link href="/faculties" className="hover:text-[#4169E1]">
            Faculties
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/faculties/${facultyId}`} className="hover:text-[#4169E1]">
            {faculty.shortName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1a1a1a]">{department.name}</span>
        </div>

        {/* Department Header */}
        <div className="bg-gradient-to-br from-white to-[#f8f9fa] rounded-lg p-8 shadow-md border border-[#e0e0e0] mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2d6a4f] to-[#1e4d39] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {department.name.split(' ').slice(-1)[0].substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1a1a1a]">
                    {department.name}
                  </h1>
                  <p className="text-sm text-[#888888] mt-1">
                    {faculty.name}
                  </p>
                </div>
              </div>
              <p className="text-[#666666] max-w-3xl">
                {department.description}
              </p>
            </div>
            <span className="text-sm bg-white text-[#666666] px-4 py-2 rounded-full whitespace-nowrap ml-4 shadow-sm border border-[#e0e0e0]">
              Est. {department.establishedYear}
            </span>
          </div>

          {/* Head Info */}
          <div className="mb-6 pb-6 border-b border-[#e0e0e0] bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f8f9fa] rounded-full flex items-center justify-center text-[#2d6a4f] font-bold">
                {department.head.split(' ')[1]?.charAt(0) || 'H'}
              </div>
              <div>
                <p className="text-xs text-[#888888] mb-1">Head of Department</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {department.head}
                </p>
              </div>
            </div>
          </div>

          {/* Department Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-[#4169E1] to-[#2a4fb8] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {department.totalStudents}
              </p>
              <p className="text-sm opacity-90">Total Students</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {department.totalStaff}
              </p>
              <p className="text-sm opacity-90">Faculty Members</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#c9a961] to-[#a68c4d] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {department.programs.length}
              </p>
              <p className="text-sm opacity-90">Programs</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {department.researchAreas.length}
              </p>
              <p className="text-sm opacity-90">Research Areas</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {department.staff.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0]">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#2d6a4f] rounded"></span>
                Publications by Faculty
              </h2>
              <BarChart data={staffPublicationsData} color="#2d6a4f" />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0]">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#2d6a4f] rounded"></span>
                Research Projects by Faculty
              </h2>
              <BarChart data={staffProjectsData} color="#2d6a4f" />
            </div>
          </div>
        )}

        {/* Programs Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0] mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#4169E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Programs Offered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {department.programs.map((program, idx) => (
              <div
                key={idx}
                className="flex items-center p-4 bg-gradient-to-r from-[#f8f9fa] to-white rounded-lg border border-[#e0e0e0] hover:border-[#4169E1] transition-colors"
              >
                <div className="w-8 h-8 bg-[#4169E1] rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0">
                  {idx + 1}
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {program}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Research Areas Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0] mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Research Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {department.researchAreas.map((area, idx) => (
              <div
                key={idx}
                className="flex items-center p-4 bg-gradient-to-r from-[#f0fdf4] to-white rounded-lg border border-[#e0e0e0] hover:border-[#22c55e] transition-colors"
              >
                <div className="w-2 h-2 bg-[#22c55e] rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Members Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
            Faculty Members
          </h2>
        </div>

        {/* Faculty Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {department.staff.map((staff, index) => {
            const initials = staff.name.split(' ').map(n => n[0]).join('');
            const colors = [
              'from-[#2d6a4f] to-[#1e4d39]',
              'from-[#4169E1] to-[#2a4fb8]',
              'from-[#c9a961] to-[#a68c4d]',
              'from-[#22c55e] to-[#16a34a]',
            ];
            const colorClass = colors[index % colors.length];

            return (
              <div
                key={staff.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#e0e0e0] hover:shadow-lg transition-all hover:border-[#2d6a4f]"
              >
                {/* Staff Avatar and Header */}
                <div className={`p-6 bg-gradient-to-br ${colorClass} text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">
                        {staff.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {staff.designation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Contact */}
                  <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
                    <p className="text-xs text-[#888888] mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </p>
                    <a
                      href={`mailto:${staff.email}`}
                      className="text-sm text-[#4169E1] hover:underline break-all"
                    >
                      {staff.email}
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                      <p className="text-xs text-[#888888] mb-1">Publications</p>
                      <p className="text-2xl font-bold text-[#1a1a1a]">
                        {staff.publications}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                      <p className="text-xs text-[#888888] mb-1">Projects</p>
                      <p className="text-2xl font-bold text-[#1a1a1a]">
                        {staff.projects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {department.staff.length === 0 && (
          <div className="bg-white rounded-lg p-12 shadow-sm border border-[#e0e0e0] text-center">
            <p className="text-[#666666]">No faculty members listed yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
