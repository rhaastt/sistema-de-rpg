import { createCampaignAction } from '@/features/campaigns/actions/campaign.actions';
import { CampaignForm } from '@/features/campaigns/components/CampaignForm';
import { Frame } from '@/shared/ui';

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Frame title="Nova campanha" subtitle="Crie uma nova campanha para sua mesa.">
        <CampaignForm action={createCampaignAction} submitLabel="Criar campanha" cancelHref="/campaigns" />
      </Frame>
    </div>
  );
}
