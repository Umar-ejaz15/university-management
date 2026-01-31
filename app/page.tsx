
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/uni-dashboard');
  return null;
}
