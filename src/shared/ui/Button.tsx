import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary';
type Size = 'default' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium ' +
  'transition-colors focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-stroke-active/40 disabled:opacity-60 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  // action/primary: fundo escuro, texto claro
  primary: 'bg-content text-content-inverse border-2 border-content hover:bg-content/90',
  // action/secondary: contorno, fundo transparente
  secondary:
    'bg-transparent text-content border-2 border-stroke hover:bg-selected/60',
};

const sizes: Record<Size, string> = {
  default: 'h-[46px] px-5 text-[14px]',
  small: 'h-[38px] px-4 text-[13px]',
};

export function Button({
  variant = 'primary',
  size = 'default',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
