import { notFound } from 'next/navigation';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getMembership } from '@/features/members/repositories/member.repository';
import { getRaces, getClasses, getAllSpecializations } from '@/infrastructure/repositories/ruleset.repository';
import { CharacterForm } from '@/features/characters/components/CharacterForm';

export default async function NewCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  const membership = await getMembership(supabase, campaignId, user.id);
  if (!membership || membership.role === 'master') notFound();

  const [races, classes, specializations] = await Promise.all([
    getRaces(supabase),
    getClasses(supabase),
    getAllSpecializations(supabase),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Criar personagem</h1>
      <CharacterForm
        campaignId={campaignId}
        races={races}
        classes={classes}
        specializations={specializations}
      />
    </div>
  );
}
