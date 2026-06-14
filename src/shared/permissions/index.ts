import type { MemberRole } from '@/shared/types/database';
import type { Character } from '@/domain/character/types';

export function isMaster(role: MemberRole): boolean {
  return role === 'master';
}

export function canEditCharacterSheet(
  userId: string,
  character: Pick<Character, 'ownerId' | 'sheetLocked'>,
  role: MemberRole,
): boolean {
  if (isMaster(role)) return true;
  return character.ownerId === userId && !character.sheetLocked;
}

export function canViewPrivateCharacterData(
  userId: string,
  characterOwnerId: string,
  role: MemberRole,
): boolean {
  return isMaster(role) || userId === characterOwnerId;
}
