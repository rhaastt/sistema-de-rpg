import type { ReactNode } from 'react';
import { cn } from './cn';

interface FrameProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  /** Conteúdo à direita do cabeçalho (ações, botões de busca). */
  actions?: ReactNode;
  /** Nível do título — use 'h2' para painéis aninhados. */
  headingTag?: 'h1' | 'h2';
  className?: string;
  children: ReactNode;
}

/**
 * Moldura "pergaminho" do tema: borda dupla com cantos em colchete,
 * cabeçalho opcional em Georgia versalete. Base visual das telas.
 */
export function Frame({ title, subtitle, actions, headingTag = 'h1', className, children }: FrameProps) {
  const Heading = headingTag;
  return (
    <section className={cn('relative rounded-panel border-2 border-stroke bg-surface', className)}>
      {/* borda interna */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6px] rounded-[8px] border border-stroke-subtle"
      />
      {/* colchetes nos cantos */}
      <Corner className="left-[3px] top-[3px] border-l-2 border-t-2" />
      <Corner className="right-[3px] top-[3px] border-r-2 border-t-2" />
      <Corner className="bottom-[3px] left-[3px] border-b-2 border-l-2" />
      <Corner className="bottom-[3px] right-[3px] border-b-2 border-r-2" />

      <div className="relative px-7 py-6">
        {(title || actions) && (
          <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-stroke-subtle pb-4">
            {title && (
              <div>
                <Heading className="text-section font-bold uppercase tracking-[0.06em] text-content">
                  {title}
                </Heading>
                {subtitle && <p className="mt-1 text-small text-content-secondary">{subtitle}</p>}
              </div>
            )}
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute h-3 w-3 border-stroke', className)}
    />
  );
}
