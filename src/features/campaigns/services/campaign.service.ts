import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { Campaign } from '@/domain/campaign/types';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/shared/errors';
import * as repo from '@/features/campaigns/repositories/campaign.repository';

type Client = SupabaseClient<Database>;

export async function createCampaign(
  supabase: Client,
  userId: string,
  input: { name: string; description?: string | null },
): Promise<Campaign> {
  return repo.createCampaign(supabase, { ownerId: userId, ...input });
}

export async function updateCampaign(
  supabase: Client,
  userId: string,
  campaignId: string,
  input: { name?: string; description?: string | null },
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
  return repo.updateCampaignStatus(supabase, campaignId, 'archived', new Date().toISOString());
}

export async function reopenCampaign(supabase: Client, userId: string, campaignId: string): Promise<Campaign> {
  const campaign = await repo.getCampaignById(supabase, campaignId);
  if (!campaign) throw new NotFoundError('Campanha');
  if (campaign.ownerId !== userId) throw new UnauthorizedError();
  if (campaign.status !== 'archived' && campaign.status !== 'ended') {
    throw new ValidationError('Somente campanhas arquivadas ou encerradas podem ser reabertas');
  }
  return repo.updateCampaignStatus(supabase, campaignId, 'preparation', null);
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
