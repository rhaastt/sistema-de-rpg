'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import type { ActionResult } from '@/shared/types/action-result';

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: 'E-mail ou senha inválidos' };

  redirect('/campaigns');
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const displayName = String(formData.get('displayName')).trim();

  if (!displayName || displayName.length < 2) {
    return { success: false, error: 'Nome de exibição deve ter ao menos 2 caracteres' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) return { success: false, error: error.message };

  redirect('/auth/login?registered=true');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
