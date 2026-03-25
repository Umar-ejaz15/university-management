/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import {
  FlaskConical,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Users,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusBadge = (status: string) => {
  if (status === 'ONGOING')   return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600 border-gray-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

export default async function AllProjectsPage({ params }: PageProps) {
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      designation: true,
      profileImage: true,
      department: { select: { name: true } },
      projects: {
        where: { verificationStatus: 'VERIFIED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!staff) notFound();

  const ongoing   = staff.projects.filter((p) => p.status === 'ONGOING').length;
  const completed = staff.projects.filter((p) => p.status === 'COMPLETED').length;
  const pending   = staff.projects.filter((p) => p.status === 'PENDING').length;

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
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research Projects</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {staff.name} · {staff.department.name} ·{' '}
                <span className="font-semibold text-purple-700">{staff.projects.length} total</span>
              </p>
            </div>
          </div>

          {/* Status breakdown */}
          {staff.projects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {ongoing > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  {ongoing} Ongoing
                </span>
              )}
              {completed > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold">
                  {completed} Completed
                </span>
              )}
              {pending > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  {pending} Pending
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {staff.projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
            <FlaskConical className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No projects yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {staff.projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:border-purple-100 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  {project.imageUrl && (
                    <img src={project.imageUrl} alt={project.title} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{project.title}</h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {project.fundingAgency && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {project.fundingAgency}
                          {project.fundingAmount && ` · ${project.fundingAmount}`}
                        </span>
                      )}
                      {(project.startDate || project.endDate) && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {project.startDate && new Date(project.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          {project.startDate && project.endDate && ' → '}
                          {project.endDate && new Date(project.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {(project as { studentCount?: number | null }).studentCount ? (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {(project as { studentCount?: number | null }).studentCount} students
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
