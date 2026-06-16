import './env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { CelestiaClient } from '@/shared/types/supabase-client';

const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

/** true quando o ambiente local do Supabase está configurado. */
export const hasSupabaseEnv = Boolean(url && anonKey && serviceKey);

const PASSWORD = 'test-password-123';

/**
 * Cliente com service role: ignora RLS. Usado apenas no setup/teardown
 * dos testes, nunca para validar permissões.
 */
export function adminClient(): SupabaseClient<Database> {
  return createClient<Database>(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface TestUser {
  id: string;
  email: string;
  /** Cliente autenticado como este usuário — sujeito a RLS, como em produção. */
  client: CelestiaClient;
}

let counter = 0;

/**
 * Cria um usuário real via Auth Admin e devolve um cliente autenticado.
 * O trigger handle_new_user cria o profile correspondente.
 */
export async function createTestUser(displayName = 'Tester'): Promise<TestUser> {
  const admin = adminClient();
  const email = `it-${Date.now()}-${counter++}@celestia.test`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error || !data.user) throw error ?? new Error('Falha ao criar usuário de teste');
  const id = data.user.id;

  const client = createClient<Database>(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (signInError) throw signInError;

  return { id, email, client: client as unknown as CelestiaClient };
}

/**
 * Remove todo o rastro dos usuários de teste, em ordem segura de FK,
 * usando o service role. Idempotente.
 */
export async function cleanupUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  const admin = adminClient();

  const { data: camps } = await admin.from('campaigns').select('id').in('owner_id', userIds);
  const campIds = (camps ?? []).map((c) => (c as { id: string }).id);

  if (campIds.length > 0) {
    await admin.from('history_log').delete().in('campaign_id', campIds);
    await admin.from('characters').delete().in('campaign_id', campIds); // cascata: classes/atributos
    await admin.from('campaign_members').delete().in('campaign_id', campIds);
    await admin.from('invites').delete().in('campaign_id', campIds);
    await admin.from('campaigns').delete().in('id', campIds);
  }

  await admin.from('history_log').delete().in('actor_id', userIds);
  await admin.from('characters').delete().in('owner_id', userIds);
  await admin.from('campaign_members').delete().in('user_id', userIds);
  await admin.from('invites').delete().in('invitee_id', userIds);
  await admin.from('invites').delete().in('inviter_id', userIds);

  for (const id of userIds) {
    await admin.auth.admin.deleteUser(id);
  }
}

export interface SlotChoice {
  classId: string;
  specializationId: string;
}

export interface Ruleset {
  raceId: (name: string) => string;
  /** Um par (classe + especialização) cuja classe NÃO é a informada em `exclude`. */
  slotFor: (className: string) => SlotChoice;
}

/**
 * Carrega ids reais de raça/classe/especialização (via service role) para
 * montar inputs válidos de criação de personagem.
 */
export async function loadRuleset(): Promise<Ruleset> {
  const admin = adminClient();
  const [{ data: races }, { data: classes }, { data: specs }] = await Promise.all([
    admin.from('races').select('id, name'),
    admin.from('classes').select('id, name'),
    admin.from('specializations').select('id, class_id, name'),
  ]);

  const raceByName = new Map((races ?? []).map((r) => [(r as any).name as string, (r as any).id as string]));
  const classByName = new Map((classes ?? []).map((c) => [(c as any).name as string, (c as any).id as string]));
  const specsByClass = new Map<string, string[]>();
  for (const s of specs ?? []) {
    const list = specsByClass.get((s as any).class_id) ?? [];
    list.push((s as any).id);
    specsByClass.set((s as any).class_id, list);
  }

  return {
    raceId(name: string) {
      const id = raceByName.get(name);
      if (!id) throw new Error(`Raça "${name}" não encontrada (seed faltando?)`);
      return id;
    },
    slotFor(className: string) {
      const classId = classByName.get(className);
      if (!classId) throw new Error(`Classe "${className}" não encontrada`);
      const specId = specsByClass.get(classId)?.[0];
      if (!specId) throw new Error(`Classe "${className}" sem especialização no seed`);
      return { classId, specializationId: specId };
    },
  };
}
