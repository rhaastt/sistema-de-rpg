import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Character, CharacterFullView } from '@/domain/character/types';
import { UnauthorizedError, NotFoundError, ValidationError, ConflictError } from '@/shared/errors';
import * as repo from '@/features/characters/repositories/character.repository';
import * as memberRepo from '@/features/members/repositories/member.repository';
import { getClassById } from '@/infrastructure/repositories/ruleset.repository';
import { insertHistoryEvent } from '@/infrastructure/repositories/history-log.repository';
import { maxHp, clampHp } from '@/domain/character/vitals';
import type { CreateCharacterInput, UpdateCharacterAttributesInput, UpdateCharacterNarrativeInput } from '@/features/characters/schemas';

type Client = CelestiaClient;

async function log(supabase: Client, entry: Database['public']['Tables']['history_log']['Insert']): Promise<void> {
  try {
    await insertHistoryEvent(supabase, entry);
  } catch {
    // best-effort
  }
}

// Restrição: a classe Bruxa só pode ser escolhida por personagens do sexo
// feminino (CLAUDE.md §5.5.2). Não depende de raça.
async function validateBruxaRestriction(
  supabase: Client,
  sex: string,
  classIds: string[],
): Promise<void> {
  if (sex === 'female') return; // mulheres podem escolher qualquer classe

  for (const classId of classIds) {
    const cls = await getClassById(supabase, classId);
    if (cls?.name === 'Bruxa') {
      throw new ValidationError('A classe Bruxa só pode ser escolhida por personagens do sexo feminino');
    }
  }
}

export async function createCharacter(
  supabase: Client,
  userId: string,
  input: CreateCharacterInput,
): Promise<Character> {
  const membership = await memberRepo.getMembership(supabase, input.campaignId, userId);
  if (!membership) throw new UnauthorizedError('Você não é participante desta campanha');
  if (membership.role === 'master') throw new ValidationError('Mestres não criam personagens');

  const existing = await repo.getCharacterByOwnerAndCampaign(supabase, userId, input.campaignId);
  if (existing) throw new ConflictError('Você já possui um personagem nesta campanha');

  const classIds = [input.slot1.classId, ...(input.slot2 ? [input.slot2.classId] : [])];
  await validateBruxaRestriction(supabase, input.sex, classIds);

  const character = await repo.createCharacter(supabase, {
    campaign_id: input.campaignId,
    owner_id: userId,
    name: input.name,
    sex: input.sex,
    age: input.age ?? null,
    race_id: input.raceId,
    region: input.region ?? null,
    visual_description: input.visualDescription ?? null,
    background: input.background ?? null,
  });

  const classRows: Array<{ characterId: string; slot: '1' | '2'; classId: string; specializationId: string }> = [
    { characterId: character.id, slot: '1', classId: input.slot1.classId, specializationId: input.slot1.specializationId },
  ];
  if (input.slot2) {
    classRows.push({ characterId: character.id, slot: '2', classId: input.slot2.classId, specializationId: input.slot2.specializationId });
  }
  await repo.upsertCharacterClasses(supabase, classRows);

  // Atributos finais (distribuído + bônus racial) calculados na criação.
  // A vida atual inicia na máxima (vida_máxima = 100 + Constituição × 10).
  if (input.attributes) {
    await repo.updateCharacterAttributes(supabase, character.id, input.attributes);
    await repo.setCurrentHp(supabase, character.id, maxHp(input.attributes.constitution));
  }

  // Perícias escolhidas na criação (origem 'criacao').
  if (input.skillIds && input.skillIds.length > 0) {
    await repo.insertCharacterSkills(supabase, character.id, input.skillIds, 'criacao');
  }

  await log(supabase, {
    campaign_id: input.campaignId,
    actor_id: userId,
    event_type: 'character_created',
    metadata: { character_name: character.name, character_id: character.id },
  });

  return character;
}

export async function getCharacterSheet(
  supabase: Client,
  userId: string,
  characterId: string,
): Promise<CharacterFullView> {
  const character = await repo.getCharacterFullView(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, userId);
  if (!membership) throw new UnauthorizedError();

  return character;
}

export async function updateCharacterNarrative(
  supabase: Client,
  userId: string,
  characterId: string,
  input: UpdateCharacterNarrativeInput,
): Promise<Character> {
  const character = await repo.getCharacterById(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, userId);
  if (!membership) throw new UnauthorizedError();

  const isMaster = membership.role === 'master';
  const isOwner = character.ownerId === userId;

  if (!isMaster && !isOwner) throw new UnauthorizedError();
  if (!isMaster && character.sheetLocked) throw new ValidationError('A ficha está bloqueada');

  const updated = await repo.updateCharacter(supabase, characterId, {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.visualDescription !== undefined && { visual_description: input.visualDescription }),
    ...(input.background !== undefined && { background: input.background }),
    ...(input.age !== undefined && { age: input.age }),
    image_url: input.imageUrl ?? null,
  });

  await log(supabase, {
    campaign_id: character.campaignId,
    actor_id: userId,
    event_type: 'character_updated',
    metadata: { character_name: character.name, character_id: characterId },
  });

  return updated;
}

export async function updateCharacterAttributes(
  supabase: Client,
  userId: string,
  characterId: string,
  input: UpdateCharacterAttributesInput,
): Promise<void> {
  const character = await repo.getCharacterById(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, userId);
  if (!membership) throw new UnauthorizedError();

  const isMaster = membership.role === 'master';
  const isOwner = character.ownerId === userId;

  if (!isMaster && !isOwner) throw new UnauthorizedError();
  if (!isMaster && character.sheetLocked) throw new ValidationError('A ficha está bloqueada');

  await repo.updateCharacterAttributes(supabase, characterId, {
    strength: input.strength,
    dexterity: input.dexterity,
    constitution: input.constitution,
    intelligence: input.intelligence,
    mind: input.mind,
    charisma: input.charisma,
  });

  // Mudança na Constituição recalcula a máxima; limita a atual à nova máxima.
  if (character.currentHp !== null) {
    await repo.setCurrentHp(supabase, characterId, clampHp(character.currentHp, input.constitution));
  }
}

/**
 * Define a vida atual do personagem. Controlada apenas pelo mestre (Compêndio §2),
 * limitada a [0, máxima] conforme a Constituição final.
 */
export async function setCharacterHp(
  supabase: Client,
  masterId: string,
  characterId: string,
  value: number,
): Promise<void> {
  const character = await repo.getCharacterFullView(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, masterId);
  if (!membership || membership.role !== 'master') {
    throw new UnauthorizedError('Apenas o mestre controla a vida atual');
  }

  await repo.setCurrentHp(supabase, characterId, clampHp(value, character.attributes.constitution));
}

export async function lockCharacterSheet(
  supabase: Client,
  masterId: string,
  characterId: string,
): Promise<Character> {
  const character = await repo.getCharacterById(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, masterId);
  if (!membership || membership.role !== 'master') throw new UnauthorizedError('Apenas o mestre pode bloquear fichas');

  const updated = await repo.updateCharacter(supabase, characterId, { sheet_locked: true });

  await log(supabase, {
    campaign_id: character.campaignId,
    actor_id: masterId,
    event_type: 'character_sheet_locked',
    metadata: { character_name: character.name, character_id: characterId },
  });

  return updated;
}

export async function unlockCharacterSheet(
  supabase: Client,
  masterId: string,
  characterId: string,
): Promise<Character> {
  const character = await repo.getCharacterById(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, masterId);
  if (!membership || membership.role !== 'master') throw new UnauthorizedError('Apenas o mestre pode desbloquear fichas');

  const updated = await repo.updateCharacter(supabase, characterId, { sheet_locked: false });

  await log(supabase, {
    campaign_id: character.campaignId,
    actor_id: masterId,
    event_type: 'character_sheet_unlocked',
    metadata: { character_name: character.name, character_id: characterId },
  });

  return updated;
}

export async function changeCharacterStatus(
  supabase: Client,
  masterId: string,
  characterId: string,
  status: 'active' | 'dead',
): Promise<Character> {
  const character = await repo.getCharacterById(supabase, characterId);
  if (!character) throw new NotFoundError('Personagem');

  const membership = await memberRepo.getMembership(supabase, character.campaignId, masterId);
  if (!membership || membership.role !== 'master') throw new UnauthorizedError('Apenas o mestre pode alterar o estado do personagem');

  const updated = await repo.updateCharacter(supabase, characterId, { status });

  await log(supabase, {
    campaign_id: character.campaignId,
    actor_id: masterId,
    event_type: 'character_status_changed',
    metadata: { character_name: character.name, character_id: characterId, new_status: status },
  });

  return updated;
}
