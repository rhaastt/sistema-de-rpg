import { SelectableCard } from '@/shared/ui';
import type { Race } from '@/domain/ruleset/types';
import { CardImage } from './CardImage';
import { formatModifiers } from './attributes';

// Imagens das raças — caminhos hardcoded adicionados manualmente em /public.
// Ex.: Humano: '/images/races/humano.webp'. Sem entrada → placeholder.
const RACE_IMAGES: Record<string, string> = {};

interface RaceCardProps {
  race: Race;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Card de raça: imagem quadrada (1:1) + nome (elemento principal) +
 * pontos de atributo, modificadores compactos/secundários e descrição.
 */
export function RaceCard({ race, selected, onSelect }: RaceCardProps) {
  const mods = formatModifiers(race.attributeModifiers);
  return (
    <SelectableCard selected={selected} onSelect={onSelect}>
      <CardImage src={RACE_IMAGES[race.name]} ratio="aspect-square" alt={race.name} />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-serif text-card-title font-bold text-content">{race.name}</span>
          <span className="shrink-0 text-label font-semibold uppercase tracking-wide text-content-secondary">
            {race.attributePoints} pts
          </span>
        </div>
        {mods && <span className="text-small text-content-secondary">{mods}</span>}
        {race.description && (
          <span className="line-clamp-3 text-small text-content-secondary">{race.description}</span>
        )}
      </div>
    </SelectableCard>
  );
}
