import { SelectableCard } from '@/shared/ui';
import { CardImage } from './CardImage';

// Imagens dos locais — caminhos hardcoded adicionados manualmente em /public.
// Ex.: Altária: '/images/regions/altaria.webp'. Sem entrada → placeholder.
const ORIGIN_IMAGES: Record<string, string> = {};

interface OriginCardProps {
  name: string;
  description: string | null;
  selected: boolean;
  onSelect: () => void;
}

/** Card de local de origem: imagem vertical (3:4) + nome + descrição. */
export function OriginCard({ name, description, selected, onSelect }: OriginCardProps) {
  return (
    <SelectableCard selected={selected} onSelect={onSelect}>
      <CardImage src={ORIGIN_IMAGES[name]} ratio="aspect-[3/4]" alt={name} />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="font-serif text-card-title font-bold text-content">{name}</span>
        {description && <span className="line-clamp-3 text-small text-content-secondary">{description}</span>}
      </div>
    </SelectableCard>
  );
}
