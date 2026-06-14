'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { requireAuthUser } from '@/shared/auth/session';
import { domainErrorMessage } from '@/shared/errors';
import type { ActionResult } from '@/shared/types/action-result';
import type { Character } from '@/domain/character/types';
import {
  CreateCharacterSchema,
  UpdateCharacterNarrativeSchema,
  UpdateCharacterAttributesSchema,
} from '@/features/characters/schemas';
import * as service from '@/features/characters/services/character.service';

export async function createCharacterAction(formData: FormData): Promise<ActionResult<Character>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = CreateCharacterSchema.safeParse({
      campaignId: formData.get('campaignId'),
      name: formData.get('name'),
      sex: formData.get('sex'),
      age: formData.get('age') || undefined,
      raceId: formData.get('raceId'),
      visualDescription: formData.get('visualDescription') || undefined,
      background: formData.get('background') || undefined,
      slot1: {
        classId: formData.get('slot1ClassId'),
        specializationId: formData.get('slot1SpecializationId'),
      },
      slot2: {
        classId: formData.get('slot2ClassId'),
        specializationId: formData.get('slot2SpecializationId'),
      },
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    const character = await service.createCharacter(supabase, user.id, parsed.data);
    revalidatePath(`/campaigns/${parsed.data.campaignId}`);
    return { success: true, data: character };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function updateCharacterNarrativeAction(
  characterId: string,
  formData: FormData,
): Promise<ActionResult<Character>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = UpdateCharacterNarrativeSchema.safeParse({
      name: formData.get('name') || undefined,
      visualDescription: formData.get('visualDescription') || undefined,
      background: formData.get('background') || undefined,
      age: formData.get('age') || undefined,
      imageUrl: formData.get('imageUrl') || undefined,
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    const character = await service.updateCharacterNarrative(supabase, user.id, characterId, parsed.data);
    revalidatePath(`/campaigns/${character.campaignId}/characters/${characterId}`);
    return { success: true, data: character };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function updateCharacterAttributesAction(
  characterId: string,
  campaignId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = UpdateCharacterAttributesSchema.safeParse({
      strength: formData.get('strength'),
      dexterity: formData.get('dexterity'),
      constitution: formData.get('constitution'),
      intelligence: formData.get('intelligence'),
      mind: formData.get('mind'),
      charisma: formData.get('charisma'),
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    await service.updateCharacterAttributes(supabase, user.id, characterId, parsed.data);
    revalidatePath(`/campaigns/${campaignId}/characters/${characterId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function lockCharacterSheetAction(
  characterId: string,
  campaignId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    await service.lockCharacterSheet(supabase, user.id, characterId);
    revalidatePath(`/campaigns/${campaignId}/characters/${characterId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function unlockCharacterSheetAction(
  characterId: string,
  campaignId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    await service.unlockCharacterSheet(supabase, user.id, characterId);
    revalidatePath(`/campaigns/${campaignId}/characters/${characterId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function changeCharacterStatusAction(
  characterId: string,
  campaignId: string,
  status: 'active' | 'dead',
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    await service.changeCharacterStatus(supabase, user.id, characterId, status);
    revalidatePath(`/campaigns/${campaignId}/characters/${characterId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function createCharacterAndRedirect(formData: FormData): Promise<void> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const parsed = CreateCharacterSchema.safeParse({
    campaignId: formData.get('campaignId'),
    name: formData.get('name'),
    sex: formData.get('sex'),
    age: formData.get('age') || undefined,
    raceId: formData.get('raceId'),
    visualDescription: formData.get('visualDescription') || undefined,
    background: formData.get('background') || undefined,
    slot1: {
      classId: formData.get('slot1ClassId'),
      specializationId: formData.get('slot1SpecializationId'),
    },
    slot2: {
      classId: formData.get('slot2ClassId'),
      specializationId: formData.get('slot2SpecializationId'),
    },
  });

  if (!parsed.success) return;

  const character = await service.createCharacter(supabase, user.id, parsed.data);
  redirect(`/campaigns/${parsed.data.campaignId}/characters/${character.id}`);
}
