/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const pubTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    JOURNAL_ARTICLE:  'bg-blue-50 text-blue-700 border-blue-200',
    CONFERENCE_PAPER: 'bg-purple-50 text-purple-700 border-purple-200',
    BOOK:             'bg-emerald-50 text-emerald-700 border-emerald-200',
    BOOK_CHAPTER:     'bg-teal-50 text-teal-700 border-teal-200',
    THESIS:           'bg-orange-50 text-orange-700 border-orange-200',
    PATENT:           'bg-red-50 text-red-700 border-red-200',
    TECHNICAL_REPORT: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[type] ?? 'bg-gray-100 text-gray-600 border-gray-200';
};

const pubTypeLabel = (type: string) =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default async function AllPublicationsPage({ params }: PageProps) {
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      designation: true,
      profileImage: true,
      department: { select: { name: true } },
      publications: { orderBy: { year: 'desc' } },
    },
  });

  if (!staff) notFound();

  const byYear = staff.publications.reduce<Record<number, typeof staff.publications>>((acc, pub) => {
    if (!acc[pub.year]) acc[pub.year] = [];
    acc[pub.year].push(pub);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

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
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {staff.name} · {staff.department.name} ·{' '}
                <span className="font-semibold text-blue-700">{staff.publications.length} total</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {staff.publications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
            <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No publications yet</p>
          </div>
        ) : (
          years.map((year) => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-bold text-gray-700">{year}</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  {byYear[year].length}
                </span>
              </div>
              <div className="space-y-3">
                {byYear[year].map((pub, index) => (
                  <div
                    key={pub.id}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-100 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {pub.imageUrl && (
                        <img src={pub.imageUrl} alt={pub.title} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{pub.title}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${pubTypeBadge(pub.publicationType)}`}>
                            {pubTypeLabel(pub.publicationType)}
                          </span>
                          {pub.journal && (
                            <span className="text-xs text-gray-500 italic">{pub.journal}</span>
                          )}
                          {pub.doi && (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#2d6a4f] hover:underline flex items-center gap-0.5"
                            >
                              DOI <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {pub.authors && (
                          <p className="text-xs text-gray-400">{pub.authors}</p>
                        )}
                        {pub.abstract && (
                          <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{pub.abstract}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
