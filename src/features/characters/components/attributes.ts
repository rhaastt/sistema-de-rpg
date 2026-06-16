import type { AttributeKey, AttributeModifiers } from '@/domain/ruleset/types';

// Rótulos e ordem dos 6 atributos (Compêndio §2), compartilhados pelas
// etapas do wizard e pelo card de raça.
export const ATTR_KEYS: AttributeKey[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'mind',
  'charisma',
];

export const ATTR_LABELS: Record<AttributeKey, string> = {
  strength: 'Força',
  dexterity: 'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  mind: 'Mente',
  charisma: 'Carisma',
};

/** Modificadores raciais em texto compacto (ex.: "+2 Destreza, -2 Força"). */
export function formatModifiers(modifiers: AttributeModifiers): string {
  return Object.entries(modifiers)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${ATTR_LABELS[k as AttributeKey] ?? k}`)
    .join(', ');
}
