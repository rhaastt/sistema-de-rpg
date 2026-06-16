'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn, Frame, SearchInput } from '@/shared/ui';
import type { CampaignWithRole, CampaignStatus } from '@/domain/campaign/types';
import { StatusBadge, STATUS_LABELS } from './StatusBadge';
import { CampaignIllustration } from './CampaignIllustration';

interface Props {
  campaigns: CampaignWithRole[];
  memberCounts: Record<string, number>;
}

const PAGE_SIZE = 6;
const FILTERS: Array<{ value: 'all' | CampaignStatus; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: STATUS_LABELS.active },
  { value: 'paused', label: STATUS_LABELS.paused },
  { value: 'preparation', label: STATUS_LABELS.preparation },
  { value: 'archived', label: STATUS_LABELS.archived },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  );
}

export function CampaignsBrowser({ campaigns, memberCounts }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || c.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [campaigns, query, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function changeFilter(value: 'all' | CampaignStatus) {
    setFilter(value);
    setPage(1);
  }

  return (
    <Frame
      title="Campanhas"
      subtitle="Gerencie e organize suas campanhas de RPG."
      actions={
        <>
          <div className="w-56">
            <SearchInput
              id="campaign-search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar campanhas..."
            />
          </div>
          <select
            aria-label="Filtrar por status"
            value={filter}
            onChange={(e) => changeFilter(e.target.value as 'all' | CampaignStatus)}
            className="h-[50px] rounded-control border-2 border-stroke-subtle bg-input px-3 text-body text-content focus:border-stroke-active focus:outline-none"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <Link
            href="/campaigns/new"
            className="inline-flex h-[50px] items-center gap-2 rounded-control border-2 border-content bg-content px-5 text-[14px] font-medium text-content-inverse transition-colors hover:bg-content/90"
          >
            <PlusIcon />
            Nova campanha
          </Link>
        </>
      }
    >
      {/* Cabeçalho da tabela */}
      <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-stroke-subtle px-3 pb-2 text-label uppercase tracking-wide text-content-secondary sm:grid">
        <span>Campanha</span>
        <span className="w-24 text-center">Jogadores</span>
        <span className="w-28 text-center">Status</span>
        <span className="w-20 text-right">Ações</span>
      </div>

      <ul className="divide-y divide-stroke-subtle">
        {visible.map((c) => (
          <li
            key={c.id}
            className="grid grid-cols-1 items-center gap-4 px-3 py-3 sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <Link href={`/campaigns/${c.id}`} className="flex min-w-0 items-center gap-3 group">
              <CampaignIllustration src={c.imageUrl} name={c.name} className="h-12 w-16 shrink-0" />
              <div className="min-w-0">
                <p className="truncate font-serif text-card-title font-bold text-content group-hover:underline">
                  {c.name}
                </p>
                <p className="text-small text-content-secondary">Iniciada em {formatDate(c.createdAt)}</p>
              </div>
            </Link>

            <span className="flex w-24 items-center justify-start gap-1.5 text-body text-content-secondary sm:justify-center">
              <UsersIcon />
              {memberCounts[c.id] ?? 0}
            </span>

            <span className="flex w-28 sm:justify-center">
              <StatusBadge status={c.status} />
            </span>

            <span className="flex w-20 items-center justify-start gap-3 text-content-secondary sm:justify-end">
              <Link href={`/campaigns/${c.id}`} aria-label="Ver campanha" className="hover:text-content">
                <EyeIcon />
              </Link>
              {c.role === 'master' && (
                <Link
                  href={`/campaigns/${c.id}/edit`}
                  aria-label="Editar campanha"
                  className="hover:text-content"
                >
                  <EditIcon />
                </Link>
              )}
            </span>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-small text-content-secondary">
          Nenhuma campanha encontrada.
        </p>
      )}

      {/* Rodapé / paginação */}
      <div className="mt-4 flex items-center justify-between border-t border-stroke-subtle pt-4 text-small text-content-secondary">
        <span>
          {filtered.length === 0
            ? 'Nenhuma campanha'
            : `Mostrando ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length}`}
        </span>
        <div className="flex items-center gap-2">
          <PagerButton disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} label="Anterior">
            ‹
          </PagerButton>
          <span className="min-w-7 rounded-control border border-stroke-subtle bg-page px-2 py-0.5 text-center text-content">
            {safePage}
          </span>
          <PagerButton
            disabled={safePage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            label="Próxima"
          >
            ›
          </PagerButton>
        </div>
      </div>
    </Frame>
  );
}

function PagerButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={cn(
        'h-7 w-7 rounded-control border border-stroke-subtle text-content transition-colors',
        disabled ? 'opacity-40' : 'hover:bg-selected/40',
      )}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 19a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6m5 7a5 5 0 0 0-4-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
