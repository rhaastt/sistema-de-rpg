import { cn } from './cn';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  /** URL da imagem; ausente cai no fallback com iniciais. */
  src?: string | null;
  name: string;
  size?: AvatarSize;
}

const sizes: Record<AvatarSize, string> = {
  sm: 'h-9 w-9 text-small',
  md: 'h-12 w-12 text-body',
  lg: 'h-16 w-16 text-body-lg',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** Avatar / Character — circular, com fallback de iniciais. */
export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const cls = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-stroke-subtle bg-selected',
    sizes[size],
  );

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cls} />;
  }

  return (
    <span className={cls} aria-label={name}>
      <span className="font-serif font-bold text-content">{initials(name)}</span>
    </span>
  );
}
