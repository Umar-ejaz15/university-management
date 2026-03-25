'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useDepartmentDetail } from '@/lib/queries/departments';
import Link from 'next/link';
import { use } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BarChart from '@/components/charts/BarChart';
import {
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  Calendar,
  UserCircle,
  ChevronRight,
  Home,
  FlaskConical,
  Award,
  Mail,
  ExternalLink,
  LayoutGrid,
} from 'lucide-react';


interface PageProps {
  params: Promise<{
    facultyId: string;
    departmentId: string;
  }>;
}

type TabId = 'staff' | 'programs' | 'analytics';

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
  const [activeTab, setActiveTab] = useState<TabId>('staff');

  const { data: department, isLoading: loading, error: queryError } = useDepartmentDetail(facultyId, departmentId);

  if (!loading && !department && !queryError) notFound();

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'An error occurred') : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-4 w-64 bg-white/20 rounded-lg mb-6 animate-pulse" />
            <div className="h-10 w-96 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </section>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading department details...</p>
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

  if (!department) return null;

  // Prepare chart data for staff publications and projects
  const staffPublicationsData = {
    categories: department.staff.map(s => s.name.split(' ').slice(-1)[0] || s.name.substring(0, 10)),
    values: department.staff.map(s => s.totalPublications)
  };

  const staffProjectsData = {
    categories: department.staff.map(s => s.name.split(' ').slice(-1)[0] || s.name.substring(0, 10)),
    values: department.staff.map(s => s.totalProjects)
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'staff', label: 'Staff Members', icon: <Users className="w-4 h-4" /> },
    { id: 'programs', label: 'Programs & Research', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  const deptInitials = department.name.split(' ').slice(-1)[0].substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-green-300 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-green-500" />
            <Link href="/faculties" className="hover:text-white transition-colors">
              Faculties
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-green-500" />
            <Link href={`/faculties/${facultyId}`} className="hover:text-white transition-colors">
              {department.faculty.shortName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-green-500" />
            <span className="text-white font-medium truncate max-w-[200px]">{department.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-[#c9a961]/20 border border-[#c9a961]/40 text-[#c9a961] text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  {department.faculty.shortName}
                </span>
                <span className="bg-white/10 border border-white/20 text-green-200 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Est. {department.establishedYear}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
                {department.name}
              </h1>

              <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
                <UserCircle className="w-4 h-4 shrink-0" />
                <span>Head of Department: <span className="text-white font-semibold">{department.head}</span></span>
              </div>

              {department.description && (
                <p className="text-green-100 text-sm max-w-2xl leading-relaxed">
                  {department.description}
                </p>
              )}
            </div>

            {/* Search */}
            <div className="w-full lg:max-w-md">
              <SearchBar placeholder="Search staff members or programs..." />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 4 Stat Cards */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 rounded-xl shrink-0">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{department.totalStaff}</p>
                  <p className="text-xs text-gray-400 mt-1">Staff</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-[#2d6a4f]">
              <div className="flex items-center gap-3">
                <div className="bg-[#e8f5e9] p-2.5 rounded-xl shrink-0">
                  <Award className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{department.totalPrograms}</p>
                  <p className="text-xs text-gray-400 mt-1">Programs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-xl shrink-0">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{department.totalResearchAreas}</p>
                  <p className="text-xs text-gray-400 mt-1">Research Areas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2.5 rounded-xl shrink-0">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{department.totalStudents}</p>
                  <p className="text-xs text-gray-400 mt-1">Students</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#2d6a4f] text-[#2d6a4f] bg-[#f0faf4]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">

              {/* Staff Members Tab */}
              {activeTab === 'staff' && (
                <div>
                  {department.staff.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No staff members listed</p>
                      <p className="text-sm text-gray-400 mt-1">Staff profiles will appear here once added.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {department.staff.map((staff) => {
                        const initials = staff.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();
                        return (
                          <div
                            key={staff.id}
                            className="bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#2d6a4f]/30 hover:shadow-sm transition-all p-5 flex flex-col gap-4"
                          >
                            {/* Avatar + Name */}
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#2d6a4f] to-[#52b788] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                  {staff.name}
                                </h3>
                                <p className="text-xs text-[#2d6a4f] font-medium mt-0.5">{staff.designation}</p>
                                {staff.specialization && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{staff.specialization}</p>
                                )}
                              </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                                <p className="text-sm font-bold text-purple-600 leading-none">{staff.totalPublications}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Pubs</p>
                              </div>
                              <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                                <p className="text-sm font-bold text-[#2d6a4f] leading-none">{staff.totalProjects}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Projects</p>
                              </div>
                              <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                                <p className="text-sm font-bold text-blue-600 leading-none">{staff.studentsSupervised}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Students</p>
                              </div>
                            </div>

                            {/* View Profile */}
                            <div className="pt-1">
                              <Link
                                href={`/faculty/${staff.id}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d6a4f] hover:text-[#1e4d38] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Profile
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Programs & Research Tab */}
              {activeTab === 'programs' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Programs */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <Award className="w-5 h-5 text-[#2d6a4f]" />
                      <h3 className="text-base font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Programs Offered</h3>
                    </div>
                    {department.programs.length > 0 ? (
                      <ul className="space-y-2.5">
                        {department.programs.map((program) => (
                          <li
                            key={program.id}
                            className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#c9a961] shrink-0" />
                            <span className="text-sm font-medium text-gray-700">{program.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                        <p className="text-sm text-gray-400">No programs listed</p>
                      </div>
                    )}
                  </div>

                  {/* Research Areas */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Research Areas</h3>
                    </div>
                    {department.researchAreas.length > 0 ? (
                      <ul className="space-y-2.5">
                        {department.researchAreas.map((area) => (
                          <li
                            key={area.id}
                            className="flex items-center gap-3 bg-[#e8f5e9]/60 rounded-xl px-4 py-3 border border-[#2d6a4f]/15"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#2d6a4f] shrink-0" />
                            <span className="text-sm font-medium text-gray-700">{area.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                        <p className="text-sm text-gray-400">No research areas listed</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  {department.staff.length === 0 ? (
                    <div className="text-center py-16">
                      <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No analytics available</p>
                      <p className="text-sm text-gray-400 mt-1">Analytics will appear once staff data is available.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-1">Publications by Staff</h3>
                        <p className="text-sm text-gray-400 mb-4">Total published works per staff member</p>
                        <BarChart data={staffPublicationsData} color="#c2185b" />
                      </div>
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-1">Projects by Staff</h3>
                        <p className="text-sm text-gray-400 mb-4">Research projects attributed per staff member</p>
                        <BarChart data={staffProjectsData} color="#00897b" />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
