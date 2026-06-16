export type AttributeKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'mind'
  | 'charisma';

/** Modificadores raciais por atributo (apenas os não-zero). */
export type AttributeModifiers = Partial<Record<AttributeKey, number>>;

export interface Race {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  /** Pool de Pontos de Atributo concedido pela raça (Compêndio §2/§4). */
  attributePoints: number;
  attributeModifiers: AttributeModifiers;
  createdAt: string;
}

export interface RulesetClass {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface Specialization {
  id: string;
  classId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  /** Atributo exigido (chave dos 6) ou null quando não há requisito. */
  attribute: AttributeKey | null;
  requirementValue: number | null;
  description: string | null;
  active: boolean;
}

/** Reinos conhecidos (Compêndio §1). As cidades por reino são pendência. */
export const REGIONS = ['Altária', 'Kattawood', 'Leondor', 'Barioth'] as const;
export type Region = (typeof REGIONS)[number];
