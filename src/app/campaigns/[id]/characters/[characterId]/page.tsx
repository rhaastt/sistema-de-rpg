import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getMembership } from '@/features/members/repositories/member.repository';
import { getCharacterFullView } from '@/features/characters/repositories/character.repository';
import { CharacterSheet } from '@/features/characters/components/CharacterSheet';

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { id: campaignId, characterId } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  const [membership, character] = await Promise.all([
    getMembership(supabase, campaignId, user.id),
    getCharacterFullView(supabase, characterId),
  ]);

  if (!membership || !character || character.campaignId !== campaignId) notFound();

  const isMaster = membership.role === 'master';
  const isOwner = character.ownerId === user.id;

  if (!isMaster && !isOwner) {
    // Participante vê apenas dados públicos — renderiza visão simplificada
    return (
      <div className="space-y-6">
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-small text-content-secondary hover:text-content"
        >
          ← Voltar para a campanha
        </Link>
        <div>
          <h1 className="font-serif text-page font-bold text-content">{character.name}</h1>
          <p className="mt-1 text-small text-content-secondary">
            {character.raceName} · {character.classes.map((c) => c.className).join(' / ')}
          </p>
        </div>
        {character.visualDescription && (
          <section className="flex flex-col gap-2">
            <h2 className="text-label font-semibold uppercase tracking-wide text-content-secondary">
              Descrição visual
            </h2>
            <p className="whitespace-pre-wrap text-body text-content">{character.visualDescription}</p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/campaigns/${campaignId}`}
        className="text-small text-content-secondary hover:text-content"
      >
        ← Voltar para a campanha
      </Link>
      <CharacterSheet character={character} isMaster={isMaster} isOwner={isOwner} />
    </div>
  );
}
