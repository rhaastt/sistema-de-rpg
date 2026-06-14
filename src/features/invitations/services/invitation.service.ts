import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { Invite } from '@/domain/invitation/types';
import { UnauthorizedError, NotFoundError, ConflictError, ValidationError } from '@/shared/errors';
import * as inviteRepo from '@/features/invitations/repositories/invitation.repository';
import * as memberRepo from '@/features/members/repositories/member.repository';
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';

type Client = SupabaseClient<Database>;

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

  return inviteRepo.createInvite(supabase, {
    campaignId: input.campaignId,
    inviterId: masterId,
    inviteeId: invitee.id,
  });
}

export async function acceptInvite(supabase: Client, userId: string, inviteId: string): Promise<Invite> {
  const invite = await inviteRepo.getInviteById(supabase, inviteId);
  if (!invite) throw new NotFoundError('Convite');
  if (invite.inviteeId !== userId) throw new UnauthorizedError();
  if (invite.status !== 'pending') throw new ValidationError('Convite não está pendente');

  await inviteRepo.updateInviteStatus(supabase, inviteId, 'accepted');
  await memberRepo.addMember(supabase, invite.campaignId, userId);

  return { ...invite, status: 'accepted' };
}

export async function declineInvite(supabase: Client, userId: string, inviteId: string): Promise<Invite> {
  const invite = await inviteRepo.getInviteById(supabase, inviteId);
  if (!invite) throw new NotFoundError('Convite');
  if (invite.inviteeId !== userId) throw new UnauthorizedError();
  if (invite.status !== 'pending') throw new ValidationError('Convite não está pendente');

  return inviteRepo.updateInviteStatus(supabase, inviteId, 'declined');
}

export async function cancelInvite(supabase: Client, masterId: string, inviteId: string): Promise<Invite> {
  const invite = await inviteRepo.getInviteById(supabase, inviteId);
  if (!invite) throw new NotFoundError('Convite');

  const campaign = await getCampaignById(supabase, invite.campaignId);
  if (!campaign || campaign.ownerId !== masterId) throw new UnauthorizedError();
  if (invite.status !== 'pending') throw new ValidationError('Convite não está pendente');

  return inviteRepo.updateInviteStatus(supabase, inviteId, 'cancelled');
}
