import type { CelestiaClient } from '@/shared/types/supabase-client';
import { uploadImage, deleteImageByUrl } from './image-storage';

// Bucket dedicado às imagens de campanha (ver migration 0017).
const BUCKET = 'campaign-images';

export function uploadCampaignImage(
  supabase: CelestiaClient,
  userId: string,
  file: File,
): Promise<string> {
  return uploadImage(supabase, BUCKET, userId, file);
}

export function deleteCampaignImage(supabase: CelestiaClient, imageUrl: string): Promise<void> {
  return deleteImageByUrl(supabase, BUCKET, imageUrl);
}
