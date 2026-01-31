'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import { GraduationCap, Users, Building2, BookOpen } from 'lucide-react';

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
}

/**
 * Faculties Listing Page
 *
 * Shows all academic faculties in the university
 * Data is fetched from the database via admin panel management
 */
export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchFaculties() {
      try {
        const res = await fetch('/api/faculties-list');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch faculties');
        }

        setFaculties(data.faculties);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFaculties();
  }, []);

  // Calculate total statistics
  const totalStats = {
    faculties: faculties.length,
    departments: faculties.reduce((sum, f) => sum + f.totalDepartments, 0),
    students: faculties.reduce((sum, f) => sum + f.totalStudents, 0),
    staff: faculties.reduce((sum, f) => sum + f.totalStaff, 0)
  };

  // Prepare data for charts
  const facultyStudentsData = {
    categories: faculties.map(f => f.shortName),
    values: faculties.map(f => f.totalStudents)
  };

  const facultyStaffData = {
    categories: faculties.map(f => f.shortName),
    values: faculties.map(f => f.totalStaff)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading faculties...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#2d6a4f] to-[#40916c] rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Academic Faculties
              </h1>
              <p className="text-gray-600 mt-1">
                Explore our diverse academic faculties and their departments
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-[#2d6a4f] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d6a4f] to-[#40916c] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-800">{totalStats.faculties}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">Total Faculties</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-[#4169E1] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4169E1] to-[#2a4fb8] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-800">{totalStats.departments}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">Departments</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-[#c9a961] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#c9a961] to-[#a68c4d] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-800">{totalStats.students.toLocaleString()}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">Total Students</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-[#22c55e] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-800">{totalStats.staff}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">Faculty Staff</p>
          </div>
        </div>

        {/* Charts Section */}
        {faculties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
                Students by Faculty
              </h2>
              <BarChart data={facultyStudentsData} color="#2d6a4f" />
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
                Staff by Faculty
              </h2>
              <BarChart data={facultyStaffData} color="#2d6a4f" />
            </div>
          </div>
        )}

        {/* Faculties Grid */}
        {faculties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border-2 border-gray-200 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Faculties Found</h3>
            <p className="text-gray-600">
              Faculties will appear here once they are added by the administrator.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-1.5 h-10 bg-[#2d6a4f] rounded-full"></div>
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
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 h-full group-hover:border-[#2d6a4f] group-hover:-translate-y-1">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#2d6a4f] to-[#40916c] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {faculty.shortName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-800 group-hover:text-[#2d6a4f] transition-colors">
                            {faculty.shortName}
                          </h2>
                          <span className="text-xs text-gray-500 font-medium">
                            Est. {faculty.establishedYear}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600">
                        {faculty.name}
                      </h3>
                    </div>

                    {/* Dean Info */}
                    <div className="mb-6 pb-6 border-b-2 border-gray-100">
                      <p className="text-xs text-gray-500 font-semibold mb-2">Dean</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {faculty.dean}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <p className="text-xs text-gray-600 mb-2 font-semibold">Departments</p>
                        <p className="text-2xl font-bold text-[#2d6a4f]">
                          {faculty.totalDepartments}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-xs text-gray-600 mb-2 font-semibold">Students</p>
                        <p className="text-2xl font-bold text-[#4169E1]">
                          {faculty.totalStudents > 1000
                            ? `${(faculty.totalStudents / 1000).toFixed(1)}k`
                            : faculty.totalStudents}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <p className="text-xs text-gray-600 mb-2 font-semibold">Staff</p>
                        <p className="text-2xl font-bold text-[#22c55e]">
                          {faculty.totalStaff}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {faculty.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-6">
                        {faculty.description}
                      </p>
                    )}

                    {/* View More Link */}
                    <div className="pt-6 border-t-2 border-gray-100">
                      <span className="text-sm text-[#2d6a4f] font-bold group-hover:text-[#1e4d39] flex items-center gap-2">
                        View Departments
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
