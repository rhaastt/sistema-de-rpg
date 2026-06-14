'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { requireAuthUser } from '@/shared/auth/session';
import { domainErrorMessage } from '@/shared/errors';
import type { ActionResult } from '@/shared/types/action-result';
import type { Campaign } from '@/domain/campaign/types';
import { CreateCampaignSchema, UpdateCampaignSchema } from '@/features/campaigns/schemas';
import * as service from '@/features/campaigns/services/campaign.service';
import type { Database } from '@/shared/types/database';

export async function createCampaignAction(formData: FormData): Promise<ActionResult<Campaign>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = CreateCampaignSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    const campaign = await service.createCampaign(supabase, user.id, parsed.data);
    revalidatePath('/campaigns');
    return { success: true, data: campaign };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function updateCampaignAction(
  campaignId: string,
  formData: FormData,
): Promise<ActionResult<Campaign>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = UpdateCampaignSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    const campaign = await service.updateCampaign(supabase, user.id, campaignId, parsed.data);
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true, data: campaign };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function changeCampaignStatusAction(
  campaignId: string,
  status: Database['public']['Enums']['campaign_status'],
): Promise<ActionResult<Campaign>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const campaign = await service.changeCampaignStatus(supabase, user.id, campaignId, status);
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/campaigns');
    return { success: true, data: campaign };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function archiveCampaignAction(campaignId: string): Promise<void> {
  const user = await requireAuthUser();
  const supabase = await createClient();
  await service.archiveCampaign(supabase, user.id, campaignId);
  revalidatePath('/campaigns');
  redirect('/campaigns');
}
