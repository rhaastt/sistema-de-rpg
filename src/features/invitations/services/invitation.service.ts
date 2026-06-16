import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Invite } from '@/domain/invitation/types';
import { UnauthorizedError, NotFoundError, ConflictError, ValidationError } from '@/shared/errors';
import * as inviteRepo from '@/features/invitations/repositories/invitation.repository';
import * as memberRepo from '@/features/members/repositories/member.repository';
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';
import { insertHistoryEvent } from '@/infrastructure/repositories/history-log.repository';

type Client = CelestiaClient;

async function log(supabase: Client, entry: Database['public']['Tables']['history_log']['Insert']): Promise<void> {
  try {
    await insertHistoryEvent(supabase, entry);
  } catch {
    // best-effort
  }
}

export async function sendInvite(
  supabase: Client,
  masterId: string,
  input: { campaignId: string; inviteeEmail: string },
): Promise<Invite> {
  const campaign = await getCampaignById(supabase, input.campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== masterId) throw new UnauthorizedError('Apenas o mestre pode enviar convites');

  const invitee = await inviteRepo.findProfileByEmail(supabase, input.inviteeEmail);
  if (!invitee) throw new NotFoundError('Usuário com este e-mail');
  if (invitee.id === masterId) throw new ValidationError('O mestre não pode convidar a si mesmo');

  const existing = await memberRepo.getMembership(supabase, input.campaignId, invitee.id);
  if (existing) throw new ConflictError('Usuário já é participante desta campanha');

  const invite = await inviteRepo.createInvite(supabase, {
    campaignId: input.campaignId,
    inviterId: masterId,
    inviteeId: invitee.id,
  });

  await log(supabase, {
    campaign_id: input.campaignId,
    actor_id: masterId,
    event_type: 'invite_sent',
    metadata: { invitee_email: input.inviteeEmail, invite_id: invite.id },
  });

  return invite;
}

export async function acceptInvite(supabase: Client, userId: string, inviteId: string): Promise<Invite> {
  const invite = await inviteRepo.getInviteById(supabase, inviteId);
  if (!invite) throw new NotFoundError('Convite');
  if (invite.inviteeId !== userId) throw new UnauthorizedError();
  if (invite.status !== 'pending') throw new ValidationError('Convite não está pendente');

  await inviteRepo.updateInviteStatus(supabase, inviteId, 'accepted');
  await memberRepo.addMember(supabase, invite.campaignId, userId);

  await log(supabase, {
    campaign_id: invite.campaignId,
    actor_id: userId,
    event_type: 'invite_accepted',
    metadata: { invite_id: inviteId },
  });

  return { ...invite, status: 'accepted' };
}

export async function declineInvite(supabase: Client, userId: string, inviteId: string): Promise<Invite> {
  const invite = await inviteRepo.getInviteById(supabase, inviteId);
  if (!invite) throw new NotFoundError('Convite');
  if (invite.inviteeId !== userId) throw new UnauthorizedError();
  if (invite.status !== 'pending') throw new ValidationError('Convite não está pendente');

  const updated = await inviteRepo.updateInviteStatus(supabase, inviteId, 'declined');

  // O convidado não é membro, mas a policy 0014 permite registrar
  // eventos de convites endereçados a ele (visível ao mestre).
  await log(supabase, {
    campaign_id: invite.campaignId,
    actor_id: userId,
    event_type: 'invite_declined',
    metadata: { invite_id: inviteId },
  });

  return updated;
}

export async function cancelInvite(supabase: Client, masterId: string, inviteId: string): Promise<Invite> {
  const invite = await inviteRepo.getInviteById(supabase, inviteId);
  if (!invite) throw new NotFoundError('Convite');

  const campaign = await getCampaignById(supabase, invite.campaignId);
  if (!campaign || campaign.ownerId !== masterId) throw new UnauthorizedError();
  if (invite.status !== 'pending') throw new ValidationError('Convite não está pendente');

  const updated = await inviteRepo.updateInviteStatus(supabase, inviteId, 'cancelled');

  await log(supabase, {
    campaign_id: invite.campaignId,
    actor_id: masterId,
    event_type: 'invite_cancelled',
    metadata: { invite_id: inviteId },
  });

  return updated;
}
