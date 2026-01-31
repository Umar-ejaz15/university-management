'use client';

import { useEffect, useState, useCallback } from 'react';
import { GraduationCap, BookOpen, Briefcase, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Staff {
  id: string;
  name: string;
  email: string;
  designation: string;
  specialization: string | null;
  experienceYears: string | null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">Loading faculty members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Faculty Listing</h1>
              <p className="text-gray-600 mt-2">
                Browse all approved faculty members across departments
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{filteredStaff.length}</p>
              <p className="text-sm text-gray-600">Faculty Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Designations</option>
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No faculty members found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 font-semibold text-sm text-gray-700">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Designation</div>
              <div className="col-span-2 text-center">Publications</div>
              <div className="col-span-2 text-center">Projects</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Name */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-semibold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">{member.department.name}</p>
                    <p className="text-xs text-gray-500">{member.department.faculty.shortName}</p>
                  </div>

                  {/* Designation */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {member.designation}
                    </span>
                    {member.specialization && (
                      <p className="text-xs text-gray-500 mt-1">{member.specialization}</p>
                    )}
                  </div>

                  {/* Publications */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-900">
                        {member._count.publications}
                      </span>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-900">
                        {member._count.projects}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 text-center">
                    <Link
                      href={`/faculty/${member.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
