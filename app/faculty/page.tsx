import { redirect } from 'next/navigation';

/**
 * Faculty Landing Page
 * 
 * Since we need a specific faculty ID to show details,
 * this redirects to Dr. Aamir Hussain's profile as the default example.
 * In a real app, this might show a list of all faculty or a search page.
 */
export default function FacultyPage() {
  redirect('/faculty/aamir-hussain');
}
