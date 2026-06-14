export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function IPDisclosuresRedirect() {
  redirect('/oric/patents?tab=disclosures');
}
