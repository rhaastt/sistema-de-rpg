import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasSupabaseEnv, createTestUser, cleanupUsers, type TestUser } from '../helpers/db';
import * as campaignService from '@/features/campaigns/services/campaign.service';
import { getCampaignById, getCampaignsForUser, getMembersWithProfiles } from '@/features/campaigns/repositories/campaign.repository';

// Seção 13: arquivamento sem perda de dados, permissões de mestre, RLS de campanha.
describe.skipIf(!hasSupabaseEnv)('Campanhas (RLS + ciclo de vida)', () => {
  let master: TestUser;
  let outsider: TestUser;
  const userIds: string[] = [];

  beforeAll(async () => {
    master = await createTestUser('Mestre');
    outsider = await createTestUser('Estranho');
    userIds.push(master.id, outsider.id);
  });

  afterAll(async () => {
    await cleanupUsers(userIds);
  });

  it('cria campanha e adiciona o criador como mestre (regressão RLS insert+select)', async () => {
    const campaign = await campaignService.createCampaign(master.client, master.id, {
      name: 'Crônicas de Celestia',
    });
    expect(campaign.id).toBeTruthy();
    expect(campaign.ownerId).toBe(master.id);
    expect(campaign.status).toBe('preparation');

    // O trigger deve ter inserido o mestre como membro 'master'
    const members = await getMembersWithProfiles(master.client, campaign.id);
    const masterMember = members.find((m) => m.userId === master.id);
    expect(masterMember?.role).toBe('master');
  });

  it('lista apenas as campanhas das quais o usuário participa', async () => {
    await campaignService.createCampaign(master.client, master.id, { name: 'Visível ao mestre' });

    const mineAsMaster = await getCampaignsForUser(master.client, master.id);
    expect(mineAsMaster.length).toBeGreaterThanOrEqual(1);
    expect(mineAsMaster.every((c) => c.role === 'master')).toBe(true);

    const outsiderCampaigns = await getCampaignsForUser(outsider.client, outsider.id);
    expect(outsiderCampaigns).toHaveLength(0);
  });

  it('um estranho não consegue ler a campanha (RLS)', async () => {
    const campaign = await campaignService.createCampaign(master.client, master.id, { name: 'Privada' });
    const seenByOutsider = await getCampaignById(outsider.client, campaign.id);
    expect(seenByOutsider).toBeNull();
  });

  it('arquiva e reabre sem perder dados', async () => {
    const campaign = await campaignService.createCampaign(master.client, master.id, { name: 'Para arquivar' });

    const archived = await campaignService.archiveCampaign(master.client, master.id, campaign.id);
    expect(archived.status).toBe('archived');
    expect(archived.archivedAt).not.toBeNull();

    // Dados continuam acessíveis ao mestre após arquivar
    const stillThere = await getCampaignById(master.client, campaign.id);
    expect(stillThere?.id).toBe(campaign.id);

    const reopened = await campaignService.reopenCampaign(master.client, master.id, campaign.id);
    expect(reopened.status).toBe('preparation');
    expect(reopened.archivedAt).toBeNull();
  });

  it('um não-mestre não consegue arquivar a campanha', async () => {
    const campaign = await campaignService.createCampaign(master.client, master.id, { name: 'Protegida' });
    await expect(
      campaignService.archiveCampaign(outsider.client, outsider.id, campaign.id),
    ).rejects.toThrow();
  });
});
