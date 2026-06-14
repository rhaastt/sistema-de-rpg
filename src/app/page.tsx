import { redirect } from 'next/navigation';
import { getAuthUser } from '@/shared/auth/session';

export default async function HomePage() {
  const user = await getAuthUser();
  if (user) redirect('/campaigns');
  redirect('/auth/login');
}
