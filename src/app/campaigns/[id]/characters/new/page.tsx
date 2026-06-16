import { notFound } from 'next/navigation';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getMembership } from '@/features/members/repositories/member.repository';
import {
  getRaces,
  getClasses,
  getAllSpecializations,
  getSkills,
} from '@/infrastructure/repositories/ruleset.repository';
import { CharacterCreationWizard } from '@/features/characters/components/CharacterCreationWizard';

export default async function NewCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  // Apenas jogadores participantes criam personagem (mestres não criam).
  const membership = await getMembership(supabase, campaignId, user.id);
  if (!membership || membership.role === 'master') notFound();

  const [races, classes, specializations, skills] = await Promise.all([
    getRaces(supabase),
    getClasses(supabase),
    getAllSpecializations(supabase),
    getSkills(supabase),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <CharacterCreationWizard
        campaignId={campaignId}
        races={races}
        classes={classes}
        specializations={specializations}
        skills={skills}
      />
    </div>
  );
}
