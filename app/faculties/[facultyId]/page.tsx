'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import { getFacultyById } from '@/lib/department-data';

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
  const faculty = getFacultyById(facultyId);

  if (!faculty) {
    notFound();
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
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-[#666666]">
          <Link href="/faculties" className="hover:text-[#4169E1]">
            Faculties
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1a1a1a]">{faculty.shortName}</span>
        </div>

        {/* Faculty Header */}
        <div className="bg-gradient-to-br from-white to-[#f8f9fa] rounded-lg p-8 shadow-md border border-[#e0e0e0] mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2d6a4f] to-[#1e4d39] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {faculty.shortName.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
                  {faculty.name}
                </h1>
                <p className="text-[#666666] max-w-3xl">
                  {faculty.description}
                </p>
              </div>
            </div>
            <span className="text-sm bg-white text-[#666666] px-4 py-2 rounded-full whitespace-nowrap shadow-sm border border-[#e0e0e0]">
              Est. {faculty.establishedYear}
            </span>
          </div>

          {/* Dean Info */}
          <div className="mb-6 pb-6 border-b border-[#e0e0e0] bg-white rounded-lg p-4">
            <p className="text-sm text-[#888888] mb-1">Dean</p>
            <p className="text-lg font-semibold text-[#1a1a1a]">
              {faculty.dean}
            </p>
          </div>

          {/* Faculty Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#2d6a4f] to-[#1e4d39] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {faculty.totalDepartments}
              </p>
              <p className="text-sm opacity-90">Departments</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#4169E1] to-[#2a4fb8] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {faculty.totalStudents.toLocaleString()}
              </p>
              <p className="text-sm opacity-90">Students</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {faculty.totalStaff}
              </p>
              <p className="text-sm opacity-90">Faculty Staff</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#c9a961] to-[#a68c4d] rounded-lg shadow-md text-white">
              <p className="text-4xl font-bold mb-2">
                {faculty.departments.reduce((sum, dept) => sum + dept.programs.length, 0)}
              </p>
              <p className="text-sm opacity-90">Programs</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0]">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#2d6a4f] rounded"></span>
              Students Distribution by Department
            </h2>
            <BarChart data={departmentStudentsData} color="#2d6a4f" />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0]">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#2d6a4f] rounded"></span>
              Staff Distribution by Department
            </h2>
            <BarChart data={departmentStaffData} color="#2d6a4f" />
          </div>
        </div>

        {/* Departments Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
            Departments
          </h2>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faculty.departments.map((department, index) => {
            const colors = [
              'from-[#2d6a4f] to-[#1e4d39]',
              'from-[#4169E1] to-[#2a4fb8]',
              'from-[#c9a961] to-[#a68c4d]',
              'from-[#22c55e] to-[#16a34a]',
              'from-[#ef4444] to-[#dc2626]',
            ];
            const colorClass = colors[index % colors.length];

            return (
              <Link
                key={department.id}
                href={`/faculties/${facultyId}/${department.id}`}
                className="block group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e0e0e0] h-full group-hover:border-[#2d6a4f]">
                  {/* Colored Header Bar */}
                  <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>
                  
                  <div className="p-6">
                    {/* Department Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#2d6a4f] transition-colors">
                        {department.name}
                      </h3>
                      <p className="text-sm text-[#666666] mb-3 line-clamp-2">
                        {department.description}
                      </p>
                    </div>

                    {/* Department Head */}
                    <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
                      <p className="text-xs text-[#888888] mb-1">Head of Department</p>
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        {department.head}
                      </p>
                    </div>

                    {/* Department Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                        <p className="text-xs text-[#888888] mb-1">Students</p>
                        <p className="text-xl font-bold text-[#1a1a1a]">
                          {department.totalStudents}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                        <p className="text-xs text-[#888888] mb-1">Staff</p>
                        <p className="text-xl font-bold text-[#1a1a1a]">
                          {department.totalStaff}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                        <p className="text-xs text-[#888888] mb-1">Programs</p>
                        <p className="text-xl font-bold text-[#1a1a1a]">
                          {department.programs.length}
                        </p>
                      </div>
                    </div>

                    {/* Programs List */}
                    <div className="mb-4">
                      <p className="text-xs text-[#888888] mb-2">Programs Offered</p>
                      <div className="flex flex-wrap gap-2">
                        {department.programs.map((program, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-[#f0f0ed] text-[#666666] px-3 py-1 rounded-full border border-[#e0e0e0]"
                          >
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View More */}
                    <div className="pt-4 border-t border-[#e0e0e0]">
                      <span className="text-sm text-[#2d6a4f] font-medium group-hover:text-[#1e4d39] flex items-center gap-2">
                        View Department Details
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
