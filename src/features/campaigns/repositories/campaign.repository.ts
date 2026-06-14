import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { Campaign, CampaignWithRole, MemberWithProfile } from '@/domain/campaign/types';

type Client = SupabaseClient<Database>;

function rowToCampaign(r: Database['public']['Tables']['campaigns']['Row']): Campaign {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    description: r.description,
    status: r.status,
    archivedAt: r.archived_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getCampaignById(supabase: Client, id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return rowToCampaign(data);
}

export async function getCampaignsForUser(supabase: Client, userId: string): Promise<CampaignWithRole[]> {
  const { data, error } = await supabase
    .from('campaign_members')
    .select('role, campaigns(*)')
    .eq('user_id', userId)
    .is('removed_at', null);
  if (error || !data) return [];
  return data.flatMap((row) => {
    const c = row.campaigns;
    if (!c) return [];
    return [{
      ...rowToCampaign(c),
      role: row.role,
    }];
  });
}

export async function createCampaign(
  supabase: Client,
  payload: { ownerId: string; name: string; description?: string | null },
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ owner_id: payload.ownerId, name: payload.name, description: payload.description ?? null })
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao criar campanha');
  return rowToCampaign(data);
}

export async function updateCampaign(
  supabase: Client,
  id: string,
  payload: { name?: string; description?: string | null },
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar campanha');
  return rowToCampaign(data);
}

export async function updateCampaignStatus(
  supabase: Client,
  id: string,
  status: Database['public']['Enums']['campaign_status'],
  archivedAt?: string | null,
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status, archived_at: archivedAt })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar status da campanha');
  return rowToCampaign(data);
}

export async function getMembersWithProfiles(supabase: Client, campaignId: string): Promise<MemberWithProfile[]> {
  const { data, error } = await supabase
    .from('campaign_members')
    .select('*, profiles(id, display_name, avatar_url)')
    .eq('campaign_id', campaignId)
    .is('removed_at', null);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    campaignId: row.campaign_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    removedAt: row.removed_at,
    profile: {
      id: row.profiles?.id ?? row.user_id,
      displayName: row.profiles?.display_name ?? '',
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
  }));
}
