import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  /** Conteúdo à direita do título (ações). */
  actions?: ReactNode;
}

/** Panel / Details — painel de detalhes com cabeçalho opcional. */
export function Panel({ title, actions, className, children, ...props }: PanelProps) {
  return (
    <section
      className={cn('rounded-panel border-2 border-stroke-subtle bg-surface', className)}
      {...props}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-stroke-subtle px-6 py-4">
          {title && <h2 className="text-section">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

/** Linha rótulo/valor para dentro de um Panel. */
export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-stroke-subtle py-3 last:border-b-0">
      <span className="text-label uppercase tracking-wide text-content-secondary">{label}</span>
      <span className="text-body text-content">{children}</span>
    </div>
  );
}
