import { createCampaignAction } from '@/features/campaigns/actions/campaign.actions';
import { CampaignForm } from '@/features/campaigns/components/CampaignForm';

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold">Nova campanha</h1>
      <CampaignForm action={createCampaignAction} submitLabel="Criar campanha" />
    </div>
  );
}
