import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { Membership } from '@/domain/membership/types';

type Client = SupabaseClient<Database>;

export async function getMembership(
  supabase: Client,
  campaignId: string,
  userId: string,
): Promise<Membership | null> {
  const { data, error } = await supabase
    .from('campaign_members')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .is('removed_at', null)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    campaignId: data.campaign_id,
    userId: data.user_id,
    role: data.role,
    joinedAt: data.joined_at,
    removedAt: data.removed_at,
  };
}

export async function addMember(
  supabase: Client,
  campaignId: string,
  userId: string,
): Promise<Membership> {
  const { data, error } = await supabase
    .from('campaign_members')
    .insert({ campaign_id: campaignId, user_id: userId, role: 'player' })
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao adicionar participante');
  return {
    id: data.id,
    campaignId: data.campaign_id,
    userId: data.user_id,
    role: data.role,
    joinedAt: data.joined_at,
    removedAt: data.removed_at,
  };
}

export async function softRemoveMember(
  supabase: Client,
  campaignId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('campaign_members')
    .update({ removed_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .is('removed_at', null);
  if (error) throw error;
}
