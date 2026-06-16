import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Invite, InviteWithDetails } from '@/domain/invitation/types';

type Client = CelestiaClient;
type InviteRow = Database['public']['Tables']['invites']['Row'];
type InviteStatus = Database['public']['Enums']['invite_status'];

function rowToInvite(r: InviteRow): Invite {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    inviterId: r.inviter_id,
    inviteeId: r.invitee_id,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function enrichInvites(supabase: Client, invites: Invite[]): Promise<InviteWithDetails[]> {
  if (invites.length === 0) return [];

  const campaignIds = [...new Set(invites.map((i) => i.campaignId))];
  const profileIds = [...new Set([...invites.map((i) => i.inviterId), ...invites.map((i) => i.inviteeId)])];

  const [{ data: campaignsRaw }, { data: profilesRaw }] = await Promise.all([
    supabase.from('campaigns').select('id, name').in('id', campaignIds),
    supabase.from('profiles').select('id, display_name').in('id', profileIds),
  ]);

  const campaigns = (campaignsRaw as { id: string; name: string }[] | null) ?? [];
  const profiles = (profilesRaw as { id: string; display_name: string }[] | null) ?? [];

  const cMap = new Map(campaigns.map((c) => [c.id, c.name]));
  const pMap = new Map(profiles.map((p) => [p.id, p.display_name]));

  return invites.map((inv) => ({
    ...inv,
    campaignName: cMap.get(inv.campaignId) ?? '',
    inviterName: pMap.get(inv.inviterId) ?? '',
    inviteeName: pMap.get(inv.inviteeId) ?? '',
  }));
}

export async function getInviteById(supabase: Client, id: string): Promise<InviteWithDetails | null> {
  const { data, error } = await supabase.from('invites').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  const [enriched] = await enrichInvites(supabase, [rowToInvite(data as InviteRow)]);
  return enriched ?? null;
}

export async function getPendingInvitesForCampaign(supabase: Client, campaignId: string): Promise<InviteWithDetails[]> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending');
  if (error || !data) return [];
  return enrichInvites(supabase, (data as InviteRow[]).map(rowToInvite));
}

export async function getPendingInvitesForUser(supabase: Client, userId: string): Promise<InviteWithDetails[]> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('invitee_id', userId)
    .eq('status', 'pending');
  if (error || !data) return [];
  return enrichInvites(supabase, (data as InviteRow[]).map(rowToInvite));
}

export async function findProfileByEmail(supabase: Client, email: string): Promise<{ id: string; displayName: string } | null> {
  const { data, error } = await supabase.from('profiles').select('id, display_name').eq('email', email).maybeSingle();
  if (error || !data) return null;
  const p = data as { id: string; display_name: string };
  return { id: p.id, displayName: p.display_name };
}

export async function createInvite(
  supabase: Client,
  payload: { campaignId: string; inviterId: string; inviteeId: string },
): Promise<Invite> {
  const { data, error } = await supabase
    .from('invites')
    .insert({ campaign_id: payload.campaignId, inviter_id: payload.inviterId, invitee_id: payload.inviteeId } as any)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao criar convite');
  return rowToInvite(data as InviteRow);
}

export async function updateInviteStatus(
  supabase: Client,
  id: string,
  status: InviteStatus,
): Promise<Invite> {
  const { data, error } = await (supabase.from('invites') as any).update({ status }).eq('id', id).select().single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar convite');
  return rowToInvite(data as InviteRow);
}
