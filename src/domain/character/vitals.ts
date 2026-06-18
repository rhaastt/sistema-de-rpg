// Fórmulas de vitais do Compêndio §2. Valores derivados do atributo final
// (distribuído + bônus racial), nunca armazenados — calculados na leitura.

/** vida_máxima = 100 + (Constituição_final × 10) */
export function maxHp(constitutionFinal: number): number {
  return 100 + constitutionFinal * 10;
}

/** capacidade de carga (kg) = 10 + Força_final */
export function carryCapacity(strengthFinal: number): number {
  return 10 + strengthFinal;
}

/** Mantém a vida atual no intervalo [0, máxima]. */
export function clampHp(current: number, constitutionFinal: number): number {
  const max = maxHp(constitutionFinal);
  return Math.max(0, Math.min(current, max));
}
