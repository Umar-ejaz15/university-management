export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function IPLicensingRedirect() {
  redirect('/oric/patents?tab=licensing');
}
