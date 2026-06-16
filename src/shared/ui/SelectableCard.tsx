import type { ReactNode } from 'react';
import { cn } from './cn';

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Casco genérico de card selecionável: borda, estados (selecionado, hover,
 * desabilitado) e evento de seleção. Não conhece o conteúdo — recebe filhos
 * livres. O realce de seleção segue os tokens do tema (borda ativa + fundo).
 */
export function SelectableCard({
  selected,
  onSelect,
  disabled = false,
  className,
  children,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-card border-2 text-left transition-colors',
        selected ? 'border-stroke-active bg-selected/40' : 'border-stroke-subtle bg-page',
        !selected && !disabled && 'hover:border-stroke',
        disabled && 'opacity-60',
        className,
      )}
    >
      {children}
    </button>
  );
}
