import { notFound } from 'next/navigation';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getCampaignById } from '@/features/campaigns/repositories/campaign.repository';
import { CampaignForm } from '@/features/campaigns/components/CampaignForm';
import { Frame } from '@/shared/ui';
import { updateCampaignAction } from '@/features/campaigns/actions/campaign.actions';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  const campaign = await getCampaignById(supabase, id);
  if (!campaign || campaign.ownerId !== user.id) notFound();

  const boundAction = updateCampaignAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Frame title="Editar campanha" subtitle="Atualize as informações da sua campanha.">
        <CampaignForm
          action={boundAction}
          defaultValues={{
            name: campaign.name,
            description: campaign.description,
            imageUrl: campaign.imageUrl,
          }}
          submitLabel="Salvar alterações"
          cancelHref={`/campaigns/${id}`}
        />
      </Frame>
    </div>
  );
}
