import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/expenses');
  return null; // Or a loading spinner, but redirect should happen server-side
}
