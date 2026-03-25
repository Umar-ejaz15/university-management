'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Header from '@/components/Header';
import { useFacultiesList } from '@/lib/queries/faculties';
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
  ChevronRight,
  Home,
  Search,
} from 'lucide-react';


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
  const { data: faculties, isLoading, error: queryError } = useFacultiesList();

  const faculty = faculties?.find((f) => f.id === facultyId) ?? null;

  if (!isLoading && faculties && !faculty) {
    notFound();
  }

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'An error occurred') : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-8 w-48 bg-white/20 rounded-lg mb-4 animate-pulse" />
            <div className="h-10 w-80 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </section>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading faculty details...</p>
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
            <p className="text-red-800">{error || 'Faculty not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!faculty) return null;

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-green-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-green-500" />
            <Link href="/faculties" className="hover:text-white transition-colors">
              Faculties
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-green-500" />
            <span className="text-white font-medium">{faculty.shortName}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-[#c9a961]/20 border border-[#c9a961]/40 text-[#c9a961] text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  {faculty.shortName}
                </span>
                <span className="bg-white/10 border border-white/20 text-green-200 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Est. {faculty.establishedYear}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
                {faculty.name}
              </h1>
              <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
                <UserCircle className="w-4 h-4 shrink-0" />
                <span>Dean: <span className="text-white font-semibold">{faculty.dean}</span></span>
              </div>
              {faculty.description && (
                <p className="text-green-100 text-sm max-w-2xl leading-relaxed">
                  {faculty.description}
                </p>
              )}
            </div>

            {/* Search */}
            <div className="w-full lg:max-w-md">
              <SearchBar placeholder="Search departments or people..." />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Strip */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-[#2d6a4f]">
              <div className="flex items-center gap-3">
                <div className="bg-[#e8f5e9] p-2.5 rounded-xl shrink-0">
                  <Building2 className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{faculty.totalDepartments}</p>
                  <p className="text-xs text-gray-400 mt-1">Departments</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 rounded-xl shrink-0">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{faculty.totalStaff}</p>
                  <p className="text-xs text-gray-400 mt-1">Staff</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-xl shrink-0">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    {faculty.totalStudents.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Students</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2.5 rounded-xl shrink-0">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    {faculty.totalPublications.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Publications</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Departments Grid */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">All Departments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculty.departments.map((department) => (
              <Link
                key={department.id}
                href={`/faculties/${facultyId}/${department.id}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden">
                  {/* Gold top bar */}
                  <div className="h-1.5 bg-[#c9a961] w-full" />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Dept Name */}
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2d6a4f] transition-colors mb-3 leading-snug">
                      {department.name}
                    </h3>

                    {/* Head */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <UserCircle className="w-4 h-4 text-[#2d6a4f] shrink-0" />
                      <span>
                        <span className="text-gray-400 text-xs">Head: </span>
                        <span className="font-medium text-gray-700">{department.head}</span>
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                        <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none">{department.totalStudents}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Students</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                        <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none">{department.totalPublications}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Publications</p>
                        </div>
                      </div>
                    </div>

                    {/* View Dept link */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d6a4f] group-hover:text-[#1e4d38] transition-colors">
                        View Dept
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Department Analytics</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Students by Department</h3>
              <p className="text-sm text-gray-400 mb-4">Total enrolled students per department</p>
              <BarChart data={departmentStudentsData} color="#2d6a4f" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Staff by Department</h3>
              <p className="text-sm text-gray-400 mb-4">Approved faculty staff count per department</p>
              <BarChart data={departmentStaffData} color="#1976d2" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
