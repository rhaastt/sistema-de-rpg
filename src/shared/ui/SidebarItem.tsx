import type { ReactNode } from 'react';
import { cn } from './cn';

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

/**
 * Navigation / Sidebar Item — item da barra lateral (220px).
 * Espaçamento vertical generoso (≈56px de altura).
 */
export function SidebarItem({ icon, label, active, href, onClick }: SidebarItemProps) {
  const classes = cn(
    'flex h-14 w-full items-center gap-3 rounded-panel px-4 text-body transition-colors',
    active
      ? 'bg-selected/60 font-semibold text-content'
      : 'text-content-secondary hover:bg-selected/30 hover:text-content',
  );

  const content = (
    <>
      {icon && <span className="flex h-5 w-5 items-center justify-center">{icon}</span>}
      <span className="truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} aria-current={active ? 'page' : undefined}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-current={active ? 'page' : undefined}>
      {content}
    </button>
  );
}
