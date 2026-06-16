import { describe, it, expect } from 'vitest';
import { hasSupabaseEnv, adminClient } from '../helpers/db';

// Fase 4 — passo 1: pools e modificadores raciais (Compêndio §4).
describe.skipIf(!hasSupabaseEnv)('Catálogo de raças — stats (Fase 4)', () => {
  async function race(name: string) {
    const { data } = await adminClient()
      .from('races')
      .select('attribute_points, attribute_modifiers')
      .eq('name', name)
      .maybeSingle();
    return data as { attribute_points: number; attribute_modifiers: Record<string, number> } | null;
  }

  it('Humano: 16 pontos, sem modificadores', async () => {
    const r = await race('Humano');
    expect(r?.attribute_points).toBe(16);
    expect(r?.attribute_modifiers ?? {}).toEqual({});
  });

  it('Elfo Puro: 12 pontos com modificadores raciais', async () => {
    const r = await race('Elfo Puro');
    expect(r?.attribute_points).toBe(12);
    expect(r?.attribute_modifiers).toMatchObject({
      dexterity: 2,
      intelligence: 3,
      charisma: -2,
      strength: -2,
    });
  });

  it('Anumano Kãngues está ativo no catálogo', async () => {
    const { data } = await adminClient().from('races').select('active').eq('name', 'Anumano Kãngues').maybeSingle();
    expect((data as { active: boolean } | null)?.active).toBe(true);
  });
});
