import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Membership } from '@/domain/membership/types';

type Client = CelestiaClient;
type MemberRow = Database['public']['Tables']['campaign_members']['Row'];

export async function getMembership(supabase: Client, campaignId: string, userId: string): Promise<Membership | null> {
  const { data, error } = await supabase
    .from('campaign_members')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .is('removed_at', null)
    .maybeSingle();
  if (error || !data) return null;
  const r = data as MemberRow;
  return { id: r.id, campaignId: r.campaign_id, userId: r.user_id, role: r.role, joinedAt: r.joined_at, removedAt: r.removed_at };
}

export async function addMember(supabase: Client, campaignId: string, userId: string): Promise<Membership> {
  const { data, error } = await supabase
    .from('campaign_members')
    .insert({ campaign_id: campaignId, user_id: userId, role: 'player' } as any)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao adicionar participante');
  const r = data as MemberRow;
  return { id: r.id, campaignId: r.campaign_id, userId: r.user_id, role: r.role, joinedAt: r.joined_at, removedAt: r.removed_at };
}

export async function softRemoveMember(supabase: Client, campaignId: string, userId: string): Promise<void> {
  const { error } = await (supabase.from('campaign_members') as any)
    .update({ removed_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .is('removed_at', null);
  if (error) throw error;
}
