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
        <Link href={`/campaigns/${campaignId}`} className="text-sm text-indigo-600 hover:underline">
          ← Voltar para a campanha
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{character.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {character.raceName} · {character.classes.map((c) => c.className).join(' / ')}
          </p>
        </div>
        {character.visualDescription && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Descrição visual</h2>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{character.visualDescription}</p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/campaigns/${campaignId}`} className="text-sm text-indigo-600 hover:underline">
        ← Voltar para a campanha
      </Link>
      <CharacterSheet character={character} isMaster={isMaster} isOwner={isOwner} />
    </div>
  );
}
