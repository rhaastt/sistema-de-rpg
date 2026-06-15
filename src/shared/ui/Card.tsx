import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Quando true, ganha realce de estado selecionado. */
  selected?: boolean;
  /** Quando true, aplica feedback de hover (uso clicável). */
  interactive?: boolean;
}

const base = 'rounded-card border-2 bg-surface p-5 transition-colors';

/** Card base (surface/card). Use para listas de campanhas, fichas, etc. */
export function Card({ selected, interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        base,
        selected ? 'border-stroke-active bg-selected/40' : 'border-stroke-subtle',
        interactive && 'cursor-pointer hover:border-stroke',
        className,
      )}
      {...props}
    />
  );
}

interface CampaignCardProps {
  name: string;
  description?: string | null;
  status: string;
  role?: 'master' | 'player';
  onClick?: () => void;
}

/** Card / Campaign — composição de Card para a lista de campanhas. */
export function CampaignCard({ name, description, status, role, onClick }: CampaignCardProps) {
  return (
    <Card interactive={Boolean(onClick)} onClick={onClick} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-card-title">{name}</h3>
        <Badge>{status}</Badge>
      </div>
      {description && (
        <p className="line-clamp-2 text-small text-content-secondary">{description}</p>
      )}
      {role && (
        <span className="text-label uppercase tracking-wide text-content-secondary">
          {role === 'master' ? 'Mestre' : 'Jogador'}
        </span>
      )}
    </Card>
  );
}

interface CharacterCardProps {
  name: string;
  raceName?: string;
  className_?: string;
  avatar?: ReactNode;
  dead?: boolean;
  onClick?: () => void;
}

/** Card / Character — composição compacta com avatar e dados públicos. */
export function CharacterCard({
  name,
  raceName,
  className_,
  avatar,
  dead,
  onClick,
}: CharacterCardProps) {
  return (
    <Card interactive={Boolean(onClick)} onClick={onClick} className="flex items-center gap-4">
      {avatar}
      <div className="flex min-w-0 flex-col">
        <h3 className="truncate text-card-title">{name}</h3>
        <p className="truncate text-small text-content-secondary">
          {[raceName, className_].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      {dead && (
        <span className="ml-auto text-label uppercase tracking-wide text-content-secondary">
          Morto
        </span>
      )}
    </Card>
  );
}

/** Etiqueta discreta (status, papéis). */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-stroke-subtle bg-page px-2.5 py-0.5 text-label text-content-secondary">
      {children}
    </span>
  );
}
