import type { CharacterStatus, CharacterSex, ClassSlot } from '@/shared/types/database';

export type { CharacterStatus, CharacterSex, ClassSlot };

export interface Character {
  id: string;
  campaignId: string;
  ownerId: string;
  name: string;
  imageUrl: string | null;
  sex: CharacterSex;
  age: number | null;
  raceId: string;
  visualDescription: string | null;
  background: string | null;
  status: CharacterStatus;
  sheetLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterClass {
  id: string;
  characterId: string;
  slot: ClassSlot;
  classId: string;
  specializationId: string;
}

export interface CharacterAttributes {
  id: string;
  characterId: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  mind: number;
  charisma: number;
  updatedAt: string;
}

export interface CharacterClassDetail extends CharacterClass {
  className: string;
  specializationName: string;
}

export interface CharacterFullView extends Character {
  raceName: string;
  classes: CharacterClassDetail[];
  attributes: CharacterAttributes;
}
