import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Campaign } from '@/domain/campaign/types';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/shared/errors';
import * as repo from '@/features/campaigns/repositories/campaign.repository';
import { insertHistoryEvent } from '@/infrastructure/repositories/history-log.repository';

type Client = CelestiaClient;

async function log(supabase: Client, entry: Database['public']['Tables']['history_log']['Insert']): Promise<void> {
  try {
    await insertHistoryEvent(supabase, entry);
  } catch {
    // History logging is best-effort; never block the main operation
  }
}

export async function createCampaign(
  supabase: Client,
  userId: string,
  input: { name: string; description?: string | null; imageUrl?: string | null },
): Promise<Campaign> {
  const campaign = await repo.createCampaign(supabase, { ownerId: userId, ...input });
  await log(supabase, {
    campaign_id: campaign.id,
    actor_id: userId,
    event_type: 'campaign_created',
    metadata: { name: campaign.name },
  });
  return campaign;
}

export async function updateCampaign(
  supabase: Client,
  userId: string,
  campaignId: string,
  input: { name?: string; description?: string | null; imageUrl?: string | null },
): Promise<Campaign> {
  const campaign = await repo.getCampaignById(supabase, campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== userId) throw new UnauthorizedError('Apenas o mestre pode editar a campanha');
  return repo.updateCampaign(supabase, campaignId, input);
}

export async function archiveCampaign(supabase: Client, userId: string, campaignId: string): Promise<Campaign> {
  const campaign = await repo.getCampaignById(supabase, campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== userId) throw new UnauthorizedError();
  if (campaign.status === 'archived') throw new ValidationError('Campanha já está arquivada');
  const updated = await repo.updateCampaignStatus(supabase, campaignId, 'archived', new Date().toISOString());
  await log(supabase, {
    campaign_id: campaignId,
    actor_id: userId,
    event_type: 'campaign_archived',
    metadata: { name: campaign.name },
  });
  return updated;
}

export async function reopenCampaign(supabase: Client, userId: string, campaignId: string): Promise<Campaign> {
  const campaign = await repo.getCampaignById(supabase, campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== userId) throw new UnauthorizedError();
  if (campaign.status !== 'archived' && campaign.status !== 'ended') {
    throw new ValidationError('Somente campanhas arquivadas ou encerradas podem ser reabertas');
  }
  const updated = await repo.updateCampaignStatus(supabase, campaignId, 'preparation', null);
  await log(supabase, {
    campaign_id: campaignId,
    actor_id: userId,
    event_type: 'campaign_reopened',
    metadata: { name: campaign.name },
  });
  return updated;
}

export async function changeCampaignStatus(
  supabase: Client,
  userId: string,
  campaignId: string,
  status: Database['public']['Enums']['campaign_status'],
): Promise<Campaign> {
  const campaign = await repo.getCampaignById(supabase, campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== userId) throw new UnauthorizedError();
  const archivedAt = status === 'archived' ? new Date().toISOString() : null;
  return repo.updateCampaignStatus(supabase, campaignId, status, archivedAt);
}
