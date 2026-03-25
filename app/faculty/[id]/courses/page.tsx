/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import {
  GraduationCap,
  ArrowLeft,
  Hash,
  Users,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AllCoursesPage({ params }: PageProps) {
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      designation: true,
      profileImage: true,
      department: { select: { name: true } },
      courses: { orderBy: { name: 'asc' } },
    },
  });

  if (!staff) notFound();

  const totalCredits  = staff.courses.reduce((s, c) => s + c.credits, 0);
  const totalStudents = staff.courses.reduce((s, c) => s + c.students, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/faculty/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to profile
          </Link>
          <div className="flex items-center gap-4">
            {staff.profileImage ? (
              <img src={staff.profileImage} alt={staff.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {staff.name} · {staff.department.name} ·{' '}
                <span className="font-semibold text-[#2d6a4f]">{staff.courses.length} courses</span>
              </p>
            </div>
          </div>

          {/* Summary pills */}
          {staff.courses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] border border-[#2d6a4f]/20 text-xs font-semibold">
                <Hash className="w-3 h-3" /> {totalCredits} total credits
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                <Users className="w-3 h-3" /> {totalStudents} students enrolled
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {staff.courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
            <GraduationCap className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No courses yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Name</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Credits</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.courses.map((course, index) => (
                  <tr key={course.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full px-3 py-0.5 text-xs font-semibold bg-[#2d6a4f]/10 text-[#2d6a4f]">
                        {course.credits} cr.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full px-3 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700">
                        {course.students}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-6 py-3 text-xs font-bold text-gray-500" colSpan={2}>Total</td>
                  <td className="px-6 py-3 text-center text-xs font-bold text-[#2d6a4f]">{totalCredits} cr.</td>
                  <td className="px-6 py-3 text-center text-xs font-bold text-orange-600">{totalStudents}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
