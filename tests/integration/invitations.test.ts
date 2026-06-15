import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasSupabaseEnv, createTestUser, cleanupUsers, type TestUser } from '../helpers/db';
import * as campaignService from '@/features/campaigns/services/campaign.service';
import * as inviteService from '@/features/invitations/services/invitation.service';
import { getMembership } from '@/features/members/repositories/member.repository';
import { getHistoryForCampaign } from '@/infrastructure/repositories/history-log.repository';

// Seção 13: aceitação/cancelamento de convites, duplicidade, convite não reutilizável.
describe.skipIf(!hasSupabaseEnv)('Convites (fluxo + RLS)', () => {
  let master: TestUser;
  let player: TestUser;
  let campaignId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    master = await createTestUser('Mestre');
    player = await createTestUser('Jogador');
    userIds.push(master.id, player.id);
    const campaign = await campaignService.createCampaign(master.client, master.id, { name: 'Mesa de Convites' });
    campaignId = campaign.id;
  });

  afterAll(async () => {
    await cleanupUsers(userIds);
  });

  it('aceitar convite torna o jogador membro (regressão RLS insert+select)', async () => {
    const invite = await inviteService.sendInvite(master.client, master.id, {
      campaignId,
      inviteeEmail: player.email,
    });
    expect(invite.status).toBe('pending');

    await inviteService.acceptInvite(player.client, player.id, invite.id);

    const membership = await getMembership(master.client, campaignId, player.id);
    expect(membership?.role).toBe('player');
  });

  it('convite aceito não pode ser reutilizado e membro não pode ser reconvidado', async () => {
    const m = await createTestUser('MestreR');
    const p = await createTestUser('JogadorR');
    userIds.push(m.id, p.id);
    const c = await campaignService.createCampaign(m.client, m.id, { name: 'Reuso' });

    const invite = await inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email });
    await inviteService.acceptInvite(p.client, p.id, invite.id);

    // aceitar de novo o mesmo convite -> não está mais pendente
    await expect(inviteService.acceptInvite(p.client, p.id, invite.id)).rejects.toThrow();

    // reconvidar quem já é membro -> conflito
    await expect(
      inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email }),
    ).rejects.toThrow();
  });

  it('não permite dois convites pendentes para o mesmo usuário/campanha', async () => {
    const m = await createTestUser('Mestre2');
    const p = await createTestUser('Convidado2');
    userIds.push(m.id, p.id);
    const c = await campaignService.createCampaign(m.client, m.id, { name: 'Dup' });

    await inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email });
    await expect(
      inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email }),
    ).rejects.toThrow();
  });

  it('recusar convite registra evento no histórico (migration 0014)', async () => {
    const m = await createTestUser('Mestre3');
    const p = await createTestUser('Convidado3');
    userIds.push(m.id, p.id);
    const c = await campaignService.createCampaign(m.client, m.id, { name: 'Recusa' });

    const invite = await inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email });
    const declined = await inviteService.declineInvite(p.client, p.id, invite.id);
    expect(declined.status).toBe('declined');

    // O mestre (membro) deve enxergar o evento de recusa no histórico
    const history = await getHistoryForCampaign(m.client, c.id);
    expect(history.some((h) => h.eventType === 'invite_declined')).toBe(true);
  });

  it('mestre cancela convite pendente; jogador não consegue cancelar', async () => {
    const m = await createTestUser('Mestre4');
    const p = await createTestUser('Convidado4');
    userIds.push(m.id, p.id);
    const c = await campaignService.createCampaign(m.client, m.id, { name: 'Cancelamento' });

    const invite = await inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email });

    // jogador não é o mestre -> não pode cancelar
    await expect(inviteService.cancelInvite(p.client, p.id, invite.id)).rejects.toThrow();

    const cancelled = await inviteService.cancelInvite(m.client, m.id, invite.id);
    expect(cancelled.status).toBe('cancelled');
  });

  it('não permite aceitar convite endereçado a outro usuário', async () => {
    const m = await createTestUser('Mestre5');
    const p = await createTestUser('Convidado5');
    const intruder = await createTestUser('Intruso5');
    userIds.push(m.id, p.id, intruder.id);
    const c = await campaignService.createCampaign(m.client, m.id, { name: 'Alvo' });

    const invite = await inviteService.sendInvite(m.client, m.id, { campaignId: c.id, inviteeEmail: p.email });
    await expect(inviteService.acceptInvite(intruder.client, intruder.id, invite.id)).rejects.toThrow();
  });
});
