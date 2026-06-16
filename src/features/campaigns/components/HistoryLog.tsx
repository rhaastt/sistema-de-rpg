import type { HistoryEntryWithActor } from '@/domain/history/types';

const EVENT_LABELS: Record<string, string> = {
  campaign_created: 'Campanha criada',
  campaign_archived: 'Campanha arquivada',
  campaign_reopened: 'Campanha reaberta',
  invite_sent: 'Convite enviado',
  invite_accepted: 'Convite aceito',
  invite_declined: 'Convite recusado',
  invite_cancelled: 'Convite cancelado',
  member_removed: 'Participante removido',
  character_created: 'Personagem criado',
  character_updated: 'Personagem atualizado',
  character_sheet_locked: 'Ficha bloqueada',
  character_sheet_unlocked: 'Ficha desbloqueada',
  character_status_changed: 'Estado do personagem alterado',
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

interface Props {
  entries: HistoryEntryWithActor[];
}

export function HistoryLog({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-small text-content-secondary">Nenhum evento registrado ainda.</p>;
  }

  return (
    <ol className="ml-1 flex flex-col gap-4 border-l border-stroke-subtle">
      {entries.map((entry) => (
        <li key={entry.id} className="relative ml-4">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-stroke bg-page" />
          <p className="text-body text-content">{EVENT_LABELS[entry.eventType] ?? entry.eventType}</p>
          <p className="text-small text-content-secondary">
            {formatDate(entry.occurredAt)}
            {entry.actorName ? ` · ${entry.actorName}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}
