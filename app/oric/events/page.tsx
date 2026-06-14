export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import EventsClient from './EventsClient';

function fmtDate(d: Date | null | undefined) {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function EventsPage() {
  const [events, visits] = await Promise.all([
    prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      select: {
        id: true, title: true, category: true, eventDate: true,
        venue: true, participants: true, scope: true, arrangedOrParticipated: true,
        subjectArea: true, outcome: true, sponsoringAgency: true,
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
    }),
    prisma.industrialVisit.findMany({
      orderBy: { visitDate: 'desc' },
      select: {
        id: true, visitorName: true, visitorOrg: true, visitDate: true,
        visitType: true, departmentVisited: true, agenda: true, outcome: true,
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
    }),
  ]);

  const eventsSer = events.map(e => ({ ...e, eventDate: fmtDate(e.eventDate), participants: e.participants ?? undefined }));
  const visitsSer = visits.map(v => ({ ...v, visitDate: fmtDate(v.visitDate) }));

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Header />
      <EventsClient events={eventsSer} visits={visitsSer} />
    </div>
  );
}
