import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) redirect('/auth/login');
  return user;
}
