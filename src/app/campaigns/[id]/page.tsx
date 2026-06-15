import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getCampaignById, getMembersWithProfiles } from '@/features/campaigns/repositories/campaign.repository';
import { getPendingInvitesForCampaign } from '@/features/invitations/repositories/invitation.repository';
import { getMembership } from '@/features/members/repositories/member.repository';
import { getCharactersForCampaign } from '@/features/characters/repositories/character.repository';
import { MemberList } from '@/features/campaigns/components/MemberList';
import { InviteForm } from '@/features/campaigns/components/InviteForm';
import { HistoryLog } from '@/features/campaigns/components/HistoryLog';
import { Frame } from '@/shared/ui';
import { StatusBadge } from '@/features/campaigns/components/StatusBadge';
import { CampaignIllustration } from '@/features/campaigns/components/CampaignIllustration';
import { archiveCampaignAction } from '@/features/campaigns/actions/campaign.actions';
import { cancelInviteAction } from '@/features/invitations/actions/invitation.actions';
import { getHistoryForCampaign } from '@/infrastructure/repositories/history-log.repository';

const outlineBtn =
  'inline-flex h-[42px] items-center justify-center gap-2 rounded-control border-2 border-stroke px-4 text-small text-content transition-colors hover:bg-selected/40';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  );
}

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  const [campaign, membership] = await Promise.all([
    getCampaignById(supabase, id),
    getMembership(supabase, id, user.id),
  ]);

  if (!campaign || !membership) notFound();
  const isMaster = membership.role === 'master';

  const [members, pendingInvites, characters, historyEntries] = await Promise.all([
    getMembersWithProfiles(supabase, id),
    isMaster ? getPendingInvitesForCampaign(supabase, id) : Promise.resolve([]),
    getCharactersForCampaign(supabase, id),
    getHistoryForCampaign(supabase, id),
  ]);

  const masterName = members.find((m) => m.role === 'master')?.profile.displayName ?? '—';
  const myCharacter = characters.find((c) => c.ownerId === user.id);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Frame>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row">
            <CampaignIllustration
              src={campaign.imageUrl}
              name={campaign.name}
              className="h-28 w-44 shrink-0"
            />
            <div>
              <h1 className="font-serif text-page font-bold text-content">{campaign.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-small text-content-secondary">
                <StatusBadge status={campaign.status} />
                <span>· Criada em {formatDate(campaign.createdAt)}</span>
              </div>
              {campaign.description && (
                <p className="mt-3 max-w-xl text-body text-content-secondary">{campaign.description}</p>
              )}
              <p className="mt-3 text-small text-content-secondary">Mestre: {masterName}</p>
            </div>
          </div>

          {isMaster && (
            <div className="flex shrink-0 flex-col gap-2">
              <Link href={`/campaigns/${id}/edit`} className={outlineBtn}>
                Editar
              </Link>
              <a href="#convidar" className={outlineBtn}>
                Convidar
              </a>
              {campaign.status !== 'archived' && (
                <form action={archiveCampaignAction.bind(null, id)}>
                  <button type="submit" className={`${outlineBtn} w-full`}>
                    Arquivar
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </Frame>

      {/* Painéis: membros, convites, atividade */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Frame headingTag="h2" title={`Membros (${members.length})`}>
          <MemberList members={members} campaignId={id} isMaster={isMaster} currentUserId={user.id} />
          {isMaster && (
            <div id="convidar" className="mt-4 border-t border-stroke-subtle pt-4">
              <p className="mb-2 text-label uppercase tracking-wide text-content-secondary">
                Convidar jogador
              </p>
              <InviteForm campaignId={id} />
            </div>
          )}
        </Frame>

        {isMaster && (
          <Frame headingTag="h2" title={`Convites pendentes (${pendingInvites.length})`}>
            {pendingInvites.length === 0 ? (
              <p className="text-small text-content-secondary">Nenhum convite pendente.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {pendingInvites.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-body text-content">{inv.inviteeName}</p>
                      <p className="text-small text-content-secondary">
                        Convidado em {formatDate(inv.createdAt)}
                      </p>
                    </div>
                    <form action={cancelInviteAction.bind(null, id, inv.id)}>
                      <button
                        type="submit"
                        className="text-small text-content-secondary hover:text-content hover:underline"
                      >
                        Cancelar
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Frame>
        )}

        <Frame headingTag="h2" title="Atividade recente">
          <HistoryLog entries={historyEntries} />
        </Frame>
      </div>

      {/* Personagens */}
      <Frame headingTag="h2" title={isMaster ? `Personagens (${characters.length})` : 'Meu personagem'}>
        {isMaster ? (
          characters.length === 0 ? (
            <p className="text-small text-content-secondary">Nenhum personagem criado ainda.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {characters.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/campaigns/${id}/characters/${c.id}`}
                    className="block rounded-card border-2 border-stroke-subtle bg-page p-4 transition-colors hover:border-stroke"
                  >
                    <p className="font-serif text-card-title font-bold text-content">{c.name}</p>
                    <p className="mt-1 text-small text-content-secondary">
                      {c.status === 'active' ? 'Ativo' : 'Morto'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : myCharacter ? (
          <Link
            href={`/campaigns/${id}/characters/${myCharacter.id}`}
            className="inline-block rounded-card border-2 border-stroke-subtle bg-page p-4 transition-colors hover:border-stroke"
          >
            <p className="font-serif text-card-title font-bold text-content">{myCharacter.name}</p>
            <p className="mt-1 text-small text-content-secondary">
              {myCharacter.status === 'active' ? 'Ativo' : 'Morto'}
            </p>
          </Link>
        ) : (
          <Link
            href={`/campaigns/${id}/characters/new`}
            className="inline-flex h-[42px] items-center rounded-control border-2 border-content bg-content px-5 text-small font-medium text-content-inverse hover:bg-content/90"
          >
            Criar personagem
          </Link>
        )}
      </Frame>
    </div>
  );
}
