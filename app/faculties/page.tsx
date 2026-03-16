'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BarChart from '@/components/charts/BarChart';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  Calendar,
  UserCircle,
  Search,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

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
    staff: faculties.reduce((sum, f) => sum + f.totalStaff, 0),
    publications: faculties.reduce((sum, f) => sum + f.totalPublications, 0),
    projects: faculties.reduce((sum, f) => sum + f.totalProjects, 0)
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-7 bg-[#c9a961] rounded-full block" />
              <span className="text-[#c9a961] text-sm font-semibold tracking-widest uppercase">MNSUAM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Academic Faculties</h1>
            <p className="text-green-200 text-base">Excellence in Agriculture &amp; Sciences</p>
          </div>
        </section>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading faculties...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2 h-7 bg-[#c9a961] rounded-full block" />
                <span className="text-[#c9a961] text-sm font-semibold tracking-widest uppercase">MNSUAM</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Academic Faculties</h1>
              <p className="text-green-200 text-base max-w-xl">
                Explore our diverse academic faculties and their departments across agriculture, sciences, and engineering.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="bg-white/15 border border-white/25 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  {totalStats.faculties} Faculties
                </span>
                <span className="bg-[#c9a961]/20 border border-[#c9a961]/40 text-[#c9a961] text-sm font-semibold px-4 py-1.5 rounded-full">
                  {totalStats.departments} Departments
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <SearchBar placeholder="Search faculties, departments, or people..." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Row */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-[#2d6a4f]">
              <div className="flex items-center gap-4">
                <div className="bg-[#e8f5e9] p-3 rounded-xl shrink-0">
                  <Building2 className="w-6 h-6 text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalStats.faculties}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Faculties</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalStats.departments}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Departments</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-xl shrink-0">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalStats.staff}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Staff</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Faculties Grid */}
        {faculties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center mb-10">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Faculties Found</h3>
            <p className="text-sm text-gray-500">
              Faculties will appear here once they are added by the administrator.
            </p>
          </div>
        ) : (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">All Faculties</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculties.map((faculty) => (
                <Link
                  key={faculty.id}
                  href={`/faculties/${faculty.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden">
                    {/* Gold top bar */}
                    <div className="h-2 bg-[#c9a961] w-full" />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Faculty Name & Short Name */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#2d6a4f] transition-colors leading-snug">
                            {faculty.name}
                          </h3>
                          <span className="shrink-0 bg-[#e8f5e9] text-[#2d6a4f] text-xs font-bold px-2.5 py-1 rounded-full">
                            {faculty.shortName}
                          </span>
                        </div>
                      </div>

                      {/* Dean & Year */}
                      <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserCircle className="w-4 h-4 text-[#2d6a4f] shrink-0" />
                          <span className="font-medium">{faculty.dean}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Est. {faculty.establishedYear}</span>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                          <Building2 className="w-4 h-4 text-[#2d6a4f]" />
                          <div>
                            <p className="text-base font-bold text-gray-900 leading-none">{faculty.totalDepartments}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Departments</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                          <Users className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-base font-bold text-gray-900 leading-none">{faculty.totalStaff}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Staff</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-base font-bold text-gray-900 leading-none">
                              {faculty.totalStudents > 1000
                                ? `${(faculty.totalStudents / 1000).toFixed(1)}k`
                                : faculty.totalStudents}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Students</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-base font-bold text-gray-900 leading-none">{faculty.totalPublications}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Publications</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {faculty.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                          {faculty.description}
                        </p>
                      )}

                      {/* View Button */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d6a4f] group-hover:text-[#1e4d38] transition-colors">
                          View Faculty
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Charts Section */}
        {faculties.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Faculty Analytics</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
                <h3 className="text-base font-bold text-gray-900 mb-1">Students by Faculty</h3>
                <p className="text-sm text-gray-400 mb-4">Total enrolled students per faculty</p>
                <BarChart data={facultyStudentsData} color="#2d6a4f" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
                <h3 className="text-base font-bold text-gray-900 mb-1">Staff by Faculty</h3>
                <p className="text-sm text-gray-400 mb-4">Approved faculty staff count per faculty</p>
                <BarChart data={facultyStaffData} color="#1976d2" />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
