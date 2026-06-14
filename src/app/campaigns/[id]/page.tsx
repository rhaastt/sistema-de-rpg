import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getCampaignById, getMembersWithProfiles } from '@/features/campaigns/repositories/campaign.repository';
import { getPendingInvitesForCampaign } from '@/features/invitations/repositories/invitation.repository';
import { getMembership } from '@/features/members/repositories/member.repository';
import { getCharactersForCampaign } from '@/features/characters/repositories/character.repository';
import { MemberList } from '@/features/campaigns/components/MemberList';
import { InviteForm } from '@/features/campaigns/components/InviteForm';
import { changeCampaignStatusAction, archiveCampaignAction } from '@/features/campaigns/actions/campaign.actions';
import { cancelInviteAction } from '@/features/invitations/actions/invitation.actions';

const STATUS_LABEL: Record<string, string> = {
  preparation: 'Em preparação',
  active: 'Em andamento',
  paused: 'Pausada',
  ended: 'Encerrada',
  archived: 'Arquivada',
};

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

  const [members, pendingInvites, characters] = await Promise.all([
    getMembersWithProfiles(supabase, id),
    isMaster ? getPendingInvitesForCampaign(supabase, id) : Promise.resolve([]),
    getCharactersForCampaign(supabase, id),
  ]);

  const myCharacter = characters.find((c) => c.ownerId === user.id);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da campanha */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          {campaign.description && <p className="mt-1 text-sm text-gray-500">{campaign.description}</p>}
          <span className="mt-2 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            {STATUS_LABEL[campaign.status] ?? campaign.status}
          </span>
        </div>
        {isMaster && (
          <div className="flex gap-2">
            <Link href={`/campaigns/${id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
              Editar
            </Link>
            {campaign.status !== 'archived' && (
              <form action={archiveCampaignAction.bind(null, id)}>
                <button type="submit" className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  Arquivar
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Meu personagem (jogador) */}
      {!isMaster && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Meu personagem</h2>
          {myCharacter ? (
            <Link href={`/campaigns/${id}/characters/${myCharacter.id}`}
              className="inline-block rounded-lg border border-gray-200 p-4 hover:border-indigo-400 hover:shadow transition">
              <p className="font-medium">{myCharacter.name}</p>
              <p className="text-xs text-gray-400 mt-1">{myCharacter.status === 'active' ? 'Ativo' : 'Morto'}</p>
            </Link>
          ) : (
            <Link href={`/campaigns/${id}/characters/new`}
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Criar personagem
            </Link>
          )}
        </section>
      )}

      {/* Personagens (mestre vê todos) */}
      {isMaster && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Personagens ({characters.length})
          </h2>
          {characters.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum personagem criado ainda.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {characters.map((c) => (
                <li key={c.id}>
                  <Link href={`/campaigns/${id}/characters/${c.id}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-400 hover:shadow transition">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.status === 'active' ? 'Ativo' : 'Morto'}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Participantes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Participantes ({members.length})
        </h2>
        <MemberList members={members} campaignId={id} isMaster={isMaster} currentUserId={user.id} />
      </section>

      {/* Convites (mestre) */}
      {isMaster && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Convidar jogador</h2>
          <InviteForm campaignId={id} />

          {pendingInvites.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Convites pendentes</h3>
              <ul className="space-y-2">
                {pendingInvites.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between text-sm text-gray-700">
                    <span>{inv.inviteeName}</span>
                    <form action={cancelInviteAction.bind(null, id, inv.id)}>
                      <button type="submit" className="text-xs text-red-500 hover:underline">Cancelar</button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
