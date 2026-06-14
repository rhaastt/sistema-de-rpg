import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { Invite, InviteWithDetails } from '@/domain/invitation/types';

type Client = SupabaseClient<Database>;

function rowToInvite(r: Database['public']['Tables']['invites']['Row']): Invite {
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

export async function getInviteById(supabase: Client, id: string): Promise<InviteWithDetails | null> {
  const { data, error } = await supabase
    .from('invites')
    .select(`
      *,
      campaigns(name),
      inviter:profiles!invites_inviter_id_fkey(display_name),
      invitee:profiles!invites_invitee_id_fkey(display_name)
    `)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return {
    ...rowToInvite(data),
    campaignName: data.campaigns?.name ?? '',
    inviterName: (data.inviter as { display_name: string } | null)?.display_name ?? '',
    inviteeName: (data.invitee as { display_name: string } | null)?.display_name ?? '',
  };
}

export async function getPendingInvitesForCampaign(supabase: Client, campaignId: string): Promise<InviteWithDetails[]> {
  const { data, error } = await supabase
    .from('invites')
    .select(`
      *,
      campaigns(name),
      inviter:profiles!invites_inviter_id_fkey(display_name),
      invitee:profiles!invites_invitee_id_fkey(display_name)
    `)
    .eq('campaign_id', campaignId)
    .eq('status', 'pending');
  if (error || !data) return [];
  return data.map((row) => ({
    ...rowToInvite(row),
    campaignName: row.campaigns?.name ?? '',
    inviterName: (row.inviter as { display_name: string } | null)?.display_name ?? '',
    inviteeName: (row.invitee as { display_name: string } | null)?.display_name ?? '',
  }));
}

export async function getPendingInvitesForUser(supabase: Client, userId: string): Promise<InviteWithDetails[]> {
  const { data, error } = await supabase
    .from('invites')
    .select(`
      *,
      campaigns(name),
      inviter:profiles!invites_inviter_id_fkey(display_name),
      invitee:profiles!invites_invitee_id_fkey(display_name)
    `)
    .eq('invitee_id', userId)
    .eq('status', 'pending');
  if (error || !data) return [];
  return data.map((row) => ({
    ...rowToInvite(row),
    campaignName: row.campaigns?.name ?? '',
    inviterName: (row.inviter as { display_name: string } | null)?.display_name ?? '',
    inviteeName: (row.invitee as { display_name: string } | null)?.display_name ?? '',
  }));
}

export async function findProfileByEmail(supabase: Client, email: string): Promise<{ id: string; displayName: string } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('email', email)
    .single();
  if (error || !data) return null;
  return { id: data.id, displayName: data.display_name };
}

export async function createInvite(
  supabase: Client,
  payload: { campaignId: string; inviterId: string; inviteeId: string },
): Promise<Invite> {
  const { data, error } = await supabase
    .from('invites')
    .insert({
      campaign_id: payload.campaignId,
      inviter_id: payload.inviterId,
      invitee_id: payload.inviteeId,
    })
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao criar convite');
  return rowToInvite(data);
}

export async function updateInviteStatus(
  supabase: Client,
  id: string,
  status: Database['public']['Enums']['invite_status'],
): Promise<Invite> {
  const { data, error } = await supabase
    .from('invites')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar convite');
  return rowToInvite(data);
}
