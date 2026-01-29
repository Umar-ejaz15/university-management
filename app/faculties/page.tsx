'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import { getAllFaculties } from '@/lib/department-data';

/**
 * Faculties Listing Page
 * 
 * Shows all academic faculties in the university
 * Each faculty card displays key statistics and links to detailed view
 */
export default function FacultiesPage() {
  const faculties = getAllFaculties();

  // Prepare data for overview charts
  const facultyStudentsData = {
    categories: faculties.map(f => f.shortName),
    values: faculties.map(f => f.totalStudents)
  };

  const facultyStaffData = {
    categories: faculties.map(f => f.shortName),
    values: faculties.map(f => f.totalStaff)
  };

  const totalStats = {
    faculties: faculties.length,
    departments: faculties.reduce((sum, f) => sum + f.totalDepartments, 0),
    students: faculties.reduce((sum, f) => sum + f.totalStudents, 0),
    staff: faculties.reduce((sum, f) => sum + f.totalStaff, 0)
  };

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
            Academic Faculties
          </h1>
          <p className="text-[#666666]">
            Explore our diverse academic faculties and their departments
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1e4d39] rounded-lg p-6 shadow-md text-white">
            <p className="text-sm opacity-90 mb-2">Total Faculties</p>
            <p className="text-4xl font-bold">{totalStats.faculties}</p>
          </div>
          <div className="bg-gradient-to-br from-[#4169E1] to-[#2a4fb8] rounded-lg p-6 shadow-md text-white">
            <p className="text-sm opacity-90 mb-2">Departments</p>
            <p className="text-4xl font-bold">{totalStats.departments}</p>
          </div>
          <div className="bg-gradient-to-br from-[#c9a961] to-[#a68c4d] rounded-lg p-6 shadow-md text-white">
            <p className="text-sm opacity-90 mb-2">Total Students</p>
            <p className="text-4xl font-bold">{totalStats.students.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-lg p-6 shadow-md text-white">
            <p className="text-sm opacity-90 mb-2">Faculty Staff</p>
            <p className="text-4xl font-bold">{totalStats.staff}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0]">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#2d6a4f] rounded"></span>
              Students by Faculty
            </h2>
            <BarChart data={facultyStudentsData} color="#2d6a4f" />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0]">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#2d6a4f] rounded"></span>
              Staff by Faculty
            </h2>
            <BarChart data={facultyStaffData} color="#2d6a4f" />
          </div>
        </div>

        {/* Faculties Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
            All Faculties
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((faculty) => (
            <Link
              key={faculty.id}
              href={`/faculties/${faculty.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all border border-[#e0e0e0] h-full group-hover:border-[#2d6a4f]">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2d6a4f] to-[#1e4d39] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {faculty.shortName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#1a1a1a]">
                          {faculty.shortName}
                        </h2>
                        <span className="text-xs text-[#888888]">
                          Est. {faculty.establishedYear}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-[#666666] mt-2">
                    {faculty.name}
                  </h3>
                </div>

                {/* Dean Info */}
                <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
                  <p className="text-xs text-[#888888] mb-1">Dean</p>
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {faculty.dean}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                    <p className="text-xs text-[#888888] mb-1">Departments</p>
                    <p className="text-xl font-bold text-[#2d6a4f]">
                      {faculty.totalDepartments}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                    <p className="text-xs text-[#888888] mb-1">Students</p>
                    <p className="text-xl font-bold text-[#4169E1]">
                      {faculty.totalStudents > 1000 
                        ? `${(faculty.totalStudents / 1000).toFixed(1)}k` 
                        : faculty.totalStudents}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                    <p className="text-xs text-[#888888] mb-1">Staff</p>
                    <p className="text-xl font-bold text-[#22c55e]">
                      {faculty.totalStaff}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#666666] line-clamp-3 mb-4">
                  {faculty.description}
                </p>

                {/* View More Link */}
                <div className="mt-auto pt-4 border-t border-[#e0e0e0]">
                  <span className="text-sm text-[#2d6a4f] font-medium group-hover:text-[#1e4d39] flex items-center gap-2">
                    View Departments
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
