import { cn } from '@/shared/ui';

interface Props {
  src?: string | null;
  name: string;
  className?: string;
}

/**
 * Ilustração da campanha. Usa a imagem (image_url) quando houver; caso
 * contrário, desenha um castelo em traço — placeholder do tema.
 */
export function CampaignIllustration({ src, name, className }: Props) {
  const box = cn('overflow-hidden rounded-default border-2 border-stroke-subtle bg-page', className);

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn(box, 'object-cover')} />;
  }

  return (
    <div className={cn(box, 'flex items-center justify-center')}>
      <svg
        viewBox="0 0 120 90"
        className="h-full w-full text-stroke/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M0 74h120" strokeWidth="1" />
        <path d="M8 74l22-30 18 16 16-24 20 22 28-18v34z" strokeWidth="1" className="text-stroke/40" />
        <path d="M44 74V40h32v34" />
        <path d="M44 40V30h6v6h6v-6h8v6h6v-6h6v10" />
        <path d="M54 74V58h12v16" />
        <circle cx="60" cy="48" r="3" />
        <path d="M40 40h40" />
      </svg>
    </div>
  );
}
