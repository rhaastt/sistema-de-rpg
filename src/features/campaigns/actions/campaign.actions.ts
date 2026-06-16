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
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';
import { uploadCampaignImage, deleteCampaignImage } from '@/infrastructure/storage/campaign-image';
import type { Database } from '@/shared/types/database';

function imageFile(formData: FormData): File | null {
  const file = formData.get('image');
  return file instanceof File && file.size > 0 ? file : null;
}

export async function createCampaignAction(_prevState: ActionResult<Campaign>, formData: FormData): Promise<ActionResult<Campaign>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = CreateCampaignSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    const file = imageFile(formData);
    const imageUrl = file ? await uploadCampaignImage(supabase, user.id, file) : null;

    const campaign = await service.createCampaign(supabase, user.id, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      imageUrl,
    });
    revalidatePath('/campaigns');
    return { success: true, data: campaign };
  } catch (e) {
    console.error('[createCampaignAction]', e);
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function updateCampaignAction(
  campaignId: string,
  _prevState: ActionResult<Campaign>,
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

    const current = await getCampaignById(supabase, campaignId);

    // imageUrl undefined = preserva; null = remove; string = nova imagem.
    const file = imageFile(formData);
    let imageUrl: string | null | undefined;
    if (file) {
      imageUrl = await uploadCampaignImage(supabase, user.id, file);
    } else if (formData.get('removeImage') === 'true') {
      imageUrl = null;
    }

    const campaign = await service.updateCampaign(supabase, user.id, campaignId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      ...(imageUrl !== undefined && { imageUrl }),
    });

    // Remove o arquivo anterior quando substituído ou removido.
    if (imageUrl !== undefined && current?.imageUrl && current.imageUrl !== imageUrl) {
      await deleteCampaignImage(supabase, current.imageUrl);
    }

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
