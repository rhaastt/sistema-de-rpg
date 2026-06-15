import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/shared/errors';
import * as memberRepo from '@/features/members/repositories/member.repository';
import * as characterRepo from '@/features/characters/repositories/character.repository';
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

  await log(supabase, {
    campaign_id: campaignId,
    actor_id: masterId,
    event_type: 'member_removed',
    metadata: { removed_user_id: targetUserId },
  });
}
