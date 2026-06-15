import { cn } from './cn';

type Resource = 'life' | 'mana';

interface ResourceBarProps {
  variant: Resource;
  value: number;
  max: number;
  /** Mostra o rótulo e o valor atual/máximo acima da barra. */
  showLabel?: boolean;
}

// Cores dedicadas (tokens --color-life / --color-mana), tons terrosos
// que harmonizam com a paleta quente do tema.
const fills: Record<Resource, string> = {
  life: 'bg-life',
  mana: 'bg-mana',
};

const labels: Record<Resource, string> = {
  life: 'Vida',
  mana: 'Mana',
};

/**
 * Resource Bar / Life + Mana. A trilha tem peso visual de destaque
 * (border/width-emphasis = 5px) e cantos totalmente arredondados.
 */
export function ResourceBar({ variant, value, max, showLabel = true }: ResourceBarProps) {
  const safeMax = Math.max(max, 1);
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <div className="flex items-baseline justify-between">
          <span className="text-label uppercase tracking-wide text-content-secondary">
            {labels[variant]}
          </span>
          <span className="text-small tabular-nums text-content">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={labels[variant]}
        className="h-[10px] w-full overflow-hidden rounded-full border-2 border-stroke-subtle bg-page"
      >
        <div className={cn('h-full rounded-full transition-[width]', fills[variant])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
