import { cn } from '@/shared/ui';

interface CardImageProps {
  /** Caminho hardcoded da imagem; ausente exibe placeholder. */
  src?: string | undefined;
  /** Classe de proporção (ex.: 'aspect-[3/4]' ou 'aspect-square'). */
  ratio: string;
  alt: string;
}

/**
 * Área de imagem no topo do card. Preenche o espaço sem distorção
 * (object-cover) e mantém a proporção; sem imagem, mostra um placeholder
 * neutro preservando a mesma proporção.
 */
export function CardImage({ src, ratio, alt }: CardImageProps) {
  return (
    <div className={cn('relative w-full overflow-hidden bg-surface', ratio)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-stroke-subtle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      )}
    </div>
  );
}
