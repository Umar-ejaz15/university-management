import { redirect } from 'next/navigation';

export default function FacultyPage() {
  // Redirect to a default faculty profile (Dr. Aamir Hussain)
  redirect('/faculty/aamir-hussain');
}
