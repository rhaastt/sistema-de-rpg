import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Campaign, CampaignWithRole, MemberWithProfile } from '@/domain/campaign/types';

type Client = CelestiaClient;
type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
type MemberRow = Database['public']['Tables']['campaign_members']['Row'];
type CampaignStatus = Database['public']['Enums']['campaign_status'];

function rowToCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    description: r.description,
    imageUrl: r.image_url,
    status: r.status,
    archivedAt: r.archived_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getCampaignById(supabase: Client, id: string): Promise<Campaign | null> {
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToCampaign(data as CampaignRow);
}

export async function getCampaignsForUser(supabase: Client, userId: string): Promise<CampaignWithRole[]> {
  const { data: membersRaw, error: e1 } = await supabase
    .from('campaign_members')
    .select('campaign_id, role')
    .eq('user_id', userId)
    .is('removed_at', null);
  if (e1 || !membersRaw) return [];

  const members = membersRaw as { campaign_id: string; role: string }[];
  if (members.length === 0) return [];

  const ids = members.map((m) => m.campaign_id);
  const { data: campaignsRaw, error: e2 } = await supabase.from('campaigns').select('*').in('id', ids);
  if (e2 || !campaignsRaw) return [];

  const campaigns = campaignsRaw as CampaignRow[];
  return campaigns.map((c) => {
    const member = members.find((m) => m.campaign_id === c.id);
    return { ...rowToCampaign(c), role: (member?.role ?? 'player') as 'master' | 'player' };
  });
}

export async function createCampaign(
  supabase: Client,
  payload: { ownerId: string; name: string; description?: string | null; imageUrl?: string | null },
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      owner_id: payload.ownerId,
      name: payload.name,
      description: payload.description ?? null,
      image_url: payload.imageUrl ?? null,
    } as any)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao criar campanha');
  return rowToCampaign(data as CampaignRow);
}

export async function updateCampaign(
  supabase: Client,
  id: string,
  payload: { name?: string; description?: string | null; imageUrl?: string | null },
): Promise<Campaign> {
  const dbPayload: Record<string, unknown> = {};
  if (payload.name !== undefined) dbPayload['name'] = payload.name;
  if (payload.description !== undefined) dbPayload['description'] = payload.description;
  if (payload.imageUrl !== undefined) dbPayload['image_url'] = payload.imageUrl;

  const { data, error } = await (supabase.from('campaigns') as any).update(dbPayload).eq('id', id).select().single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar campanha');
  return rowToCampaign(data as CampaignRow);
}

export async function updateCampaignStatus(
  supabase: Client,
  id: string,
  status: CampaignStatus,
  archivedAt?: string | null,
): Promise<Campaign> {
  const { data, error } = await (supabase.from('campaigns') as any)
    .update({ status, archived_at: archivedAt ?? null })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar status');
  return rowToCampaign(data as CampaignRow);
}

export async function getActiveMemberCounts(
  supabase: Client,
  campaignIds: string[],
): Promise<Record<string, number>> {
  if (campaignIds.length === 0) return {};
  const { data, error } = await supabase
    .from('campaign_members')
    .select('campaign_id')
    .in('campaign_id', campaignIds)
    .is('removed_at', null);
  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data as { campaign_id: string }[]) {
    counts[row.campaign_id] = (counts[row.campaign_id] ?? 0) + 1;
  }
  return counts;
}

export async function getMembersWithProfiles(supabase: Client, campaignId: string): Promise<MemberWithProfile[]> {
  const { data: membersRaw, error: e1 } = await supabase
    .from('campaign_members')
    .select('*')
    .eq('campaign_id', campaignId)
    .is('removed_at', null);
  if (e1 || !membersRaw) return [];

  const members = membersRaw as MemberRow[];
  if (members.length === 0) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profilesRaw, error: e2 } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds);
  if (e2 || !profilesRaw) return [];

  const profiles = profilesRaw as { id: string; display_name: string; avatar_url: string | null }[];
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return members.map((m) => {
    const p = profileMap.get(m.user_id);
    return {
      id: m.id,
      campaignId: m.campaign_id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      removedAt: m.removed_at,
      profile: { id: p?.id ?? m.user_id, displayName: p?.display_name ?? '', avatarUrl: p?.avatar_url ?? null },
    };
  });
}
