import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasSupabaseEnv, createTestUser, cleanupUsers, loadRuleset, adminClient, type TestUser, type Ruleset } from '../helpers/db';
import * as campaignService from '@/features/campaigns/services/campaign.service';
import * as inviteService from '@/features/invitations/services/invitation.service';
import * as characterService from '@/features/characters/services/character.service';
import type { CreateCharacterInput } from '@/features/characters/schemas';

// Seção 13: um personagem por usuário/campanha, multiclasse, Bruxa, bloqueio de ficha.
describe.skipIf(!hasSupabaseEnv)('Personagens (regras + permissões)', () => {
  let master: TestUser;
  let player: TestUser;
  let campaignId: string;
  let ruleset: Ruleset;
  const userIds: string[] = [];

  async function joinAsPlayer(p: TestUser, cId: string): Promise<void> {
    const invite = await inviteService.sendInvite(master.client, master.id, { campaignId: cId, inviteeEmail: p.email });
    await inviteService.acceptInvite(p.client, p.id, invite.id);
  }

  function baseInput(overrides: Partial<CreateCharacterInput> = {}): CreateCharacterInput {
    return {
      campaignId,
      name: 'Herói',
      sex: 'male',
      raceId: ruleset.raceId('Humano'),
      slot1: ruleset.slotFor('Guerreiro'),
      slot2: ruleset.slotFor('Mago'),
      ...overrides,
    };
  }

  beforeAll(async () => {
    ruleset = await loadRuleset();
    master = await createTestUser('Mestre');
    player = await createTestUser('Jogador');
    userIds.push(master.id, player.id);
    const campaign = await campaignService.createCampaign(master.client, master.id, { name: 'Mesa de Fichas' });
    campaignId = campaign.id;
    await joinAsPlayer(player, campaignId);
  });

  afterAll(async () => {
    await cleanupUsers(userIds);
  });

  it('cria personagem com duas combinações classe+especialização', async () => {
    const character = await characterService.createCharacter(player.client, player.id, baseInput());
    expect(character.id).toBeTruthy();

    const sheet = await characterService.getCharacterSheet(player.client, player.id, character.id);
    expect(sheet.classes).toHaveLength(2);
    expect(sheet.classes.map((c) => c.slot).sort()).toEqual(['1', '2']);
    // os seis atributos existem (criados pelo trigger)
    expect(sheet.attributes).toMatchObject({
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, mind: 0, charisma: 0,
    });
  });

  it('persiste região, atributos finais e perícias na criação (Fase 4)', async () => {
    const p = await createTestUser('JogadorFase4');
    userIds.push(p.id);
    await joinAsPlayer(p, campaignId);

    const { data: skill } = await adminClient()
      .from('skills')
      .select('id')
      .eq('name', 'Culinária')
      .maybeSingle();
    const skillId = (skill as { id: string }).id;

    const character = await characterService.createCharacter(p.client, p.id, baseInput({
      name: 'Caçador',
      region: 'Altária',
      attributes: { strength: 5, dexterity: 4, constitution: 3, intelligence: 2, mind: 1, charisma: 0 },
      skillIds: [skillId],
    }));
    expect(character.region).toBe('Altária');

    const sheet = await characterService.getCharacterSheet(p.client, p.id, character.id);
    expect(sheet.attributes).toMatchObject({ strength: 5, dexterity: 4, constitution: 3 });

    const { data: charSkills } = await adminClient()
      .from('character_skills')
      .select('skill_id, origin')
      .eq('character_id', character.id);
    expect(charSkills).toHaveLength(1);
    expect((charSkills as { skill_id: string; origin: string }[])[0]).toMatchObject({
      skill_id: skillId,
      origin: 'criacao',
    });
  });

  it('impede mais de um personagem do mesmo jogador na campanha', async () => {
    await expect(
      characterService.createCharacter(player.client, player.id, baseInput({ name: 'Segundo' })),
    ).rejects.toThrow();
  });

  it('rejeita especialização que não pertence à classe do slot (trigger)', async () => {
    const p = await createTestUser('JogadorEspec');
    userIds.push(p.id);
    await joinAsPlayer(p, campaignId);

    const guerreiro = ruleset.slotFor('Guerreiro');
    const mago = ruleset.slotFor('Mago');
    await expect(
      characterService.createCharacter(p.client, p.id, baseInput({
        campaignId,
        name: 'Inválido',
        slot1: { classId: guerreiro.classId, specializationId: mago.specializationId }, // mismatch
        slot2: mago,
      })),
    ).rejects.toThrow();
  });

  it('restrição Bruxa: bloqueia personagem masculino', async () => {
    const p = await createTestUser('JogadorBruxaM');
    userIds.push(p.id);
    await joinAsPlayer(p, campaignId);

    await expect(
      characterService.createCharacter(p.client, p.id, baseInput({
        name: 'BruxoProibido',
        sex: 'male',
        raceId: ruleset.raceId('Bruxa'),
        slot1: ruleset.slotFor('Bruxa'),
        slot2: ruleset.slotFor('Mago'),
      })),
    ).rejects.toThrow(/feminino/i);
  });

  it('restrição Bruxa: bloqueia raça não-Bruxa', async () => {
    const p = await createTestUser('JogadorBruxaR');
    userIds.push(p.id);
    await joinAsPlayer(p, campaignId);

    await expect(
      characterService.createCharacter(p.client, p.id, baseInput({
        name: 'QuaseBruxa',
        sex: 'female',
        raceId: ruleset.raceId('Humano'),
        slot1: ruleset.slotFor('Bruxa'),
        slot2: ruleset.slotFor('Mago'),
      })),
    ).rejects.toThrow(/raça Bruxa/i);
  });

  it('restrição Bruxa: permite mulher da raça Bruxa', async () => {
    const p = await createTestUser('BruxaValida');
    userIds.push(p.id);
    await joinAsPlayer(p, campaignId);

    const character = await characterService.createCharacter(p.client, p.id, baseInput({
      name: 'Morgana',
      sex: 'female',
      raceId: ruleset.raceId('Bruxa'),
      slot1: ruleset.slotFor('Bruxa'),
      slot2: ruleset.slotFor('Mago'),
    }));
    expect(character.id).toBeTruthy();
  });

  it('ficha bloqueada impede edição pelo jogador, mas o mestre ainda edita', async () => {
    const p = await createTestUser('JogadorLock');
    userIds.push(p.id);
    await joinAsPlayer(p, campaignId);
    const character = await characterService.createCharacter(p.client, p.id, baseInput({ name: 'Travável' }));

    await characterService.lockCharacterSheet(master.client, master.id, character.id);

    await expect(
      characterService.updateCharacterNarrative(p.client, p.id, character.id, { background: 'tentativa' }),
    ).rejects.toThrow(/bloqueada/i);

    // mestre consegue editar mesmo com ficha bloqueada
    const updated = await characterService.updateCharacterNarrative(master.client, master.id, character.id, {
      background: 'editado pelo mestre',
    });
    expect(updated.background).toBe('editado pelo mestre');
  });
});
