import type { CelestiaClient } from '@/shared/types/supabase-client';
import { ValidationError } from '@/shared/errors';

// Constraints padrão de upload de imagem (ver docs/specs/image-uploads.md §2).
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const ACCEPTED_IMAGE_TYPE = 'image/webp';

/**
 * Envia uma imagem (.webp) para `bucket`, na pasta do próprio usuário
 * (`{userId}/{uuid}.webp`), e devolve a URL pública. Valida formato e
 * tamanho no servidor — defesa em profundidade junto do bucket e da RLS.
 */
export async function uploadImage(
  supabase: CelestiaClient,
  bucket: string,
  userId: string,
  file: File,
): Promise<string> {
  if (file.type !== ACCEPTED_IMAGE_TYPE) {
    throw new ValidationError('A imagem deve estar no formato WebP');
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new ValidationError('A imagem deve ter no máximo 2 MB');
  }

  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: ACCEPTED_IMAGE_TYPE, upsert: false });
  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Remove de `bucket` o objeto correspondente a uma URL pública. Best-effort:
 * uma falha aqui não deve impedir a operação principal. A policy de storage
 * garante que só o dono da pasta consiga apagar.
 */
export async function deleteImageByUrl(
  supabase: CelestiaClient,
  bucket: string,
  url: string,
): Promise<void> {
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  if (!path) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // best-effort
  }
}
