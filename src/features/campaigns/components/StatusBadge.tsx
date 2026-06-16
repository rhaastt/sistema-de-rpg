import { cn } from '@/shared/ui';
import type { CampaignStatus } from '@/domain/campaign/types';

const LABELS: Record<CampaignStatus, string> = {
  preparation: 'Preparação',
  active: 'Ativa',
  paused: 'Pausada',
  ended: 'Encerrada',
  archived: 'Arquivada',
};

// Paleta monocromática: a diferença é de ênfase, não de matiz.
const TONES: Record<CampaignStatus, string> = {
  preparation: 'text-content',
  active: 'text-content',
  paused: 'text-content-secondary',
  ended: 'text-content-secondary',
  archived: 'text-content-secondary opacity-70',
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-control border border-stroke-subtle bg-page px-2.5 py-1 text-label font-semibold uppercase tracking-wide',
        TONES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}

export const STATUS_LABELS = LABELS;
