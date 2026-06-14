import Link from 'next/link';
import type { CampaignWithRole } from '@/domain/campaign/types';

const STATUS_LABEL: Record<string, string> = {
  preparation: 'Em preparação',
  active: 'Em andamento',
  paused: 'Pausada',
  ended: 'Encerrada',
  archived: 'Arquivada',
};

const STATUS_COLOR: Record<string, string> = {
  preparation: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-gray-100 text-gray-700',
  ended: 'bg-red-100 text-red-800',
  archived: 'bg-gray-200 text-gray-500',
};

interface Props {
  campaign: CampaignWithRole;
}

export function CampaignCard({ campaign }: Props) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block rounded-lg border border-gray-200 p-5 hover:border-indigo-400 hover:shadow transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{campaign.name}</h2>
          {campaign.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[campaign.status] ?? ''}`}>
          {STATUS_LABEL[campaign.status] ?? campaign.status}
        </span>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {campaign.role === 'master' ? 'Mestre' : 'Jogador'}
      </p>
    </Link>
  );
}
