import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasSupabaseEnv, createTestUser, cleanupUsers, loadRuleset, type TestUser, type Ruleset } from '../helpers/db';
import * as campaignService from '@/features/campaigns/services/campaign.service';
import * as inviteService from '@/features/invitations/services/invitation.service';
import * as characterService from '@/features/characters/services/character.service';
import * as memberService from '@/features/members/services/member.service';
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';
import { getCharacterById } from '@/features/characters/repositories/character.repository';
import type { CreateCharacterInput } from '@/features/characters/schemas';

// Seção 13: remoção de jogador, visibilidade pública/privada (RLS de atributos).
describe.skipIf(!hasSupabaseEnv)('Participantes e visibilidade (RLS)', () => {
  let master: TestUser;
  let playerA: TestUser;
  let playerB: TestUser;
  let campaignId: string;
  let charA: string;
  let ruleset: Ruleset;
  const userIds: string[] = [];

  async function joinAsPlayer(p: TestUser): Promise<void> {
    const invite = await inviteService.sendInvite(master.client, master.id, { campaignId, inviteeEmail: p.email });
    await inviteService.acceptInvite(p.client, p.id, invite.id);
  }

  function input(name: string): CreateCharacterInput {
    return {
      campaignId,
      name,
      sex: 'female',
      raceId: ruleset.raceId('Humano'),
      slot1: ruleset.slotFor('Guerreiro'),
      slot2: ruleset.slotFor('Mago'),
    };
  }

  beforeAll(async () => {
    ruleset = await loadRuleset();
    master = await createTestUser('Mestre');
    playerA = await createTestUser('JogadorA');
    playerB = await createTestUser('JogadorB');
    userIds.push(master.id, playerA.id, playerB.id);

    const campaign = await campaignService.createCampaign(master.client, master.id, { name: 'Mesa de Visibilidade' });
    campaignId = campaign.id;
    await joinAsPlayer(playerA);
    await joinAsPlayer(playerB);

    const character = await characterService.createCharacter(playerA.client, playerA.id, input('Personagem A'));
    charA = character.id;
    // dá valores aos atributos para distinguir leitura permitida x bloqueada
    await characterService.updateCharacterAttributes(playerA.client, playerA.id, charA, {
      strength: 5, dexterity: 4, constitution: 3, intelligence: 2, mind: 1, charisma: 6,
    });
  });

  afterAll(async () => {
    await cleanupUsers(userIds);
  });

  it('o dono lê os próprios atributos privados', async () => {
    const { data } = await playerA.client
      .from('character_attributes')
      .select('*')
      .eq('character_id', charA)
      .maybeSingle();
    expect((data as { strength: number } | null)?.strength).toBe(5);
  });

  it('o mestre lê os atributos privados de qualquer ficha', async () => {
    const { data } = await master.client
      .from('character_attributes')
      .select('*')
      .eq('character_id', charA)
      .maybeSingle();
    expect((data as { charisma: number } | null)?.charisma).toBe(6);
  });

  it('outro jogador NÃO lê os atributos privados (RLS)', async () => {
    const { data } = await playerB.client
      .from('character_attributes')
      .select('*')
      .eq('character_id', charA)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it('outro jogador enxerga dados básicos do personagem (público)', async () => {
    const basic = await getCharacterById(playerB.client, charA);
    expect(basic?.name).toBe('Personagem A');
  });

  it('remover jogador marca o personagem como morto e revoga o acesso', async () => {
    await memberService.removeMember(master.client, master.id, campaignId, playerA.id);

    // personagem marcado como morto (verificado pelo mestre)
    const character = await getCharacterById(master.client, charA);
    expect(character?.status).toBe('dead');

    // jogador removido perde acesso à campanha (RLS)
    const seen = await getCampaignById(playerA.client, campaignId);
    expect(seen).toBeNull();
  });

  it('o mestre não pode remover a si mesmo', async () => {
    await expect(
      memberService.removeMember(master.client, master.id, campaignId, master.id),
    ).rejects.toThrow();
  });
});
