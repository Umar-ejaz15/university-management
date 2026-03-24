'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback } from 'react';
import { GraduationCap, BookOpen, FlaskConical, Search, Users, Building2, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Staff {
  id: string;
  name: string;
  email: string;
  designation: string;
  specialization: string | null;
  experienceYears: string | null;
  profileImage: string | null;
  department: {
    name: string;
    faculty: {
      name: string;
      shortName: string;
    };
  };
  _count: {
    publications: number;
    projects: number;
    courses: number;
  };
}

export default function StaffListingPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDesignation, setSelectedDesignation] = useState('all');

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/all');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
        setFilteredStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterStaff = useCallback(() => {
    let filtered = [...staff];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((s) => s.department.name === selectedDepartment);
    }

    // Designation filter
    if (selectedDesignation !== 'all') {
      filtered = filtered.filter((s) => s.designation === selectedDesignation);
    }

    setFilteredStaff(filtered);
  }, [staff, searchQuery, selectedDepartment, selectedDesignation]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    filterStaff();
  }, [filterStaff]);

  const departments = [...new Set(staff.map((s) => s.department.name))];
  const designations = [...new Set(staff.map((s) => s.designation))];

  const totalPublications = staff.reduce((sum, s) => sum + s._count.publications, 0);
  const avgPublications = staff.length > 0 ? (totalPublications / staff.length).toFixed(1) : '0';

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const hasActiveFilters =
    searchQuery || selectedDepartment !== 'all' || selectedDesignation !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
    setSelectedDesignation('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto" />
            <p className="mt-5 text-gray-500 font-medium">Loading faculty members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
                  MNSUAM
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Faculty Members</h1>
              <p className="text-white/70 text-lg">
                Meet our distinguished academic community
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                <p className="text-3xl font-bold text-[#c9a961]">{filteredStaff.length}</p>
                <p className="text-white/70 text-sm mt-1">Members Shown</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                <p className="text-3xl font-bold text-[#c9a961]">{staff.length}</p>
                <p className="text-white/70 text-sm mt-1">Total Faculty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="flex items-center gap-4 py-5 px-6">
              <div className="w-10 h-10 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
                <p className="text-sm text-gray-500">Total Members</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-5 px-6">
              <div className="w-10 h-10 rounded-xl bg-[#c9a961]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#c9a961]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                <p className="text-sm text-gray-500">Departments</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-5 px-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgPublications}</p>
                <p className="text-sm text-gray-500">Avg Publications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-all"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none bg-white transition-all min-w-50"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Designation Filter */}
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none bg-white transition-all min-w-50"
            >
              <option value="all">All Designations</option>
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <p className="mt-3 text-xs text-gray-400 pl-1">
              Showing {filteredStaff.length} of {staff.length} faculty members
            </p>
          )}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <GraduationCap className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No faculty members found</h3>
            <p className="text-gray-500 text-sm mb-6">
              No results match your current filters. Try adjusting your search.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#1e4d38] transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#2d6a4f]/20 transition-all duration-200 flex flex-col"
              >
                {/* Card Top */}
                <div className="p-6 flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl shrink-0 overflow-hidden border-2 border-[#2d6a4f]/20">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = 'none';
                          const parent = el.parentElement;
                          if (parent) {
                            parent.classList.add('bg-[#2d6a4f]/10', 'flex', 'items-center', 'justify-center');
                            parent.innerHTML = `<span class="text-[#2d6a4f] font-bold text-lg">${getInitials(member.name)}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center">
                        <span className="text-[#2d6a4f] font-bold text-lg">{getInitials(member.name)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{member.name}</h3>
                    <p className="text-sm font-medium text-[#c9a961] mt-0.5 truncate">
                      {member.designation}
                    </p>
                    <span className="inline-block mt-2 rounded-full px-3 py-1 text-xs font-semibold bg-[#2d6a4f]/10 text-[#2d6a4f] truncate max-w-full">
                      {member.department.name}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="mx-6 mb-4 border border-gray-100 rounded-xl grid grid-cols-2 divide-x divide-gray-100">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{member._count.publications}</p>
                      <p className="text-xs text-gray-400">Publications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <FlaskConical className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{member._count.projects}</p>
                      <p className="text-xs text-gray-400">Projects</p>
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/faculty/${member.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2d6a4f]/30 text-[#2d6a4f] text-sm font-semibold hover:bg-[#2d6a4f] hover:text-white hover:border-[#2d6a4f] transition-all duration-200"
                  >
                    View Profile
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
