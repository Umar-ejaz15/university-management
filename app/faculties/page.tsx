'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BarChart from '@/components/charts/BarChart';

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
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Loading faculties...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header with Search */}
        <div className="mb-8 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 tracking-tight">
              Academic Faculties
            </h1>
            <p className="text-sm text-[#666666]">
              Explore our diverse academic faculties and their departments
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchBar placeholder="Search faculties, departments, or people..." />
          </div>
        </div>

        {/* Overview Stats */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e8f5e9] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#2d6a4f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full">Total</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStats.faculties}</p>
              <p className="text-sm text-[#666666]">Total Faculties</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e3f2fd] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#1976d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#1976d2] bg-[#e3f2fd] px-3 py-1 rounded-full">Active</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStats.departments}</p>
              <p className="text-sm text-[#666666]">Departments</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#f3e5f5] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#7b1fa2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#7b1fa2] bg-[#f3e5f5] px-3 py-1 rounded-full">Enrolled</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStats.students.toLocaleString()}</p>
              <p className="text-sm text-[#666666]">Total Students</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#fff3e0] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#e65100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#e65100] bg-[#fff3e0] px-3 py-1 rounded-full">Active</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStats.staff}</p>
              <p className="text-sm text-[#666666]">Faculty Staff</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#fce4ec] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#c2185b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#c2185b] bg-[#fce4ec] px-3 py-1 rounded-full">Total</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStats.publications.toLocaleString()}</p>
              <p className="text-sm text-[#666666]">Publications</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e0f2f1] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#00897b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#00897b] bg-[#e0f2f1] px-3 py-1 rounded-full">Total</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStats.projects}</p>
              <p className="text-sm text-[#666666]">Projects</p>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        {faculties.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
              Faculty Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Students by Faculty</h3>
                <BarChart data={facultyStudentsData} color="#2d6a4f" />
              </div>
              <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Staff by Faculty</h3>
                <BarChart data={facultyStaffData} color="#1976d2" />
              </div>
            </div>
          </section>
        )}

        {/* Faculties Grid */}
        {faculties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-[#e5e5e5] text-center">
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">No Faculties Found</h3>
            <p className="text-sm text-[#666666]">
              Faculties will appear here once they are added by the administrator.
            </p>
          </div>
        ) : (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
              All Faculties
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculties.map((faculty) => (
                <Link
                  key={faculty.id}
                  href={`/faculties/${faculty.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-[#e5e5e5] h-full group-hover:border-[#2d6a4f]">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#e8f5e9] rounded-xl flex items-center justify-center text-[#2d6a4f] font-bold text-lg">
                            {faculty.shortName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#1a1a1a]">
                              {faculty.shortName}
                            </h3>
                            <span className="text-xs text-[#666666]">
                              Est. {faculty.establishedYear}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-[#666666] mt-2">
                        {faculty.name}
                      </h4>
                    </div>

                    {/* Dean Info */}
                    <div className="mb-4 pb-4 border-b border-[#e5e5e5]">
                      <p className="text-xs text-[#666666] mb-1">Dean</p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {faculty.dean}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                        <p className="text-xs text-[#666666] mb-1">Depts</p>
                        <p className="text-lg font-bold text-[#2d6a4f]">
                          {faculty.totalDepartments}
                        </p>
                      </div>
                      <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                        <p className="text-xs text-[#666666] mb-1">Students</p>
                        <p className="text-lg font-bold text-[#1976d2]">
                          {faculty.totalStudents > 1000
                            ? `${(faculty.totalStudents / 1000).toFixed(1)}k`
                            : faculty.totalStudents}
                        </p>
                      </div>
                      <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                        <p className="text-xs text-[#666666] mb-1">Staff</p>
                        <p className="text-lg font-bold text-[#e65100]">
                          {faculty.totalStaff}
                        </p>
                      </div>
                      <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                        <p className="text-xs text-[#666666] mb-1">Pubs</p>
                        <p className="text-lg font-bold text-[#c2185b]">
                          {faculty.totalPublications}
                        </p>
                      </div>
                      <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                        <p className="text-xs text-[#666666] mb-1">Projects</p>
                        <p className="text-lg font-bold text-[#00897b]">
                          {faculty.totalProjects}
                        </p>
                      </div>
                      <div className="text-center p-2.5 bg-[#f5f5f5] rounded-xl">
                        <p className="text-xs text-[#666666] mb-1">Est.</p>
                        <p className="text-lg font-bold text-[#666666]">
                          {faculty.establishedYear}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {faculty.description && (
                      <p className="text-sm text-[#666666] line-clamp-3 mb-4">
                        {faculty.description}
                      </p>
                    )}

                    {/* View More Link */}
                    <div className="mt-auto pt-4 border-t border-[#e5e5e5]">
                      <span className="text-sm text-[#2d6a4f] font-semibold group-hover:text-[#1e4d39] flex items-center gap-2">
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
          </section>
        )}
      </main>
    </div>
  );
}
