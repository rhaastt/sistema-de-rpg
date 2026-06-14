import { notFound } from 'next/navigation';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';
import { CampaignForm } from '@/features/campaigns/components/CampaignForm';
import { updateCampaignAction } from '@/features/campaigns/actions/campaign.actions';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  const campaign = await getCampaignById(supabase, id);
  if (!campaign || campaign.ownerId !== user.id) notFound();

  const boundAction = updateCampaignAction.bind(null, id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold">Editar campanha</h1>
      <CampaignForm
        action={boundAction}
        defaultValues={{ name: campaign.name, description: campaign.description }}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
