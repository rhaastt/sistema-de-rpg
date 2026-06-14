import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/shared/errors';
import * as memberRepo from '@/features/members/repositories/member.repository';
import * as characterRepo from '@/features/characters/repositories/character.repository';
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';

type Client = SupabaseClient<Database>;

export async function removeMember(
  supabase: Client,
  masterId: string,
  campaignId: string,
  targetUserId: string,
): Promise<void> {
  const campaign = await getCampaignById(supabase, campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== masterId) throw new UnauthorizedError('Apenas o mestre pode remover participantes');
  if (targetUserId === masterId) throw new ValidationError('O mestre não pode remover a si mesmo');

  const membership = await memberRepo.getMembership(supabase, campaignId, targetUserId);
  if (!membership) throw new NotFoundError('Participante');

  // Marca personagem do jogador removido como "morto"
  const character = await characterRepo.getCharacterByOwnerAndCampaign(supabase, targetUserId, campaignId);
  if (character) {
    await characterRepo.updateCharacter(supabase, character.id, { status: 'dead' });
  }

  await memberRepo.softRemoveMember(supabase, campaignId, targetUserId);
}
