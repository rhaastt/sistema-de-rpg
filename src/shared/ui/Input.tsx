import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Ícone à esquerda (ex.: lupa na busca). */
  leading?: ReactNode;
}

const fieldBase =
  'h-[50px] w-full rounded-control border-2 bg-input px-4 text-body text-content ' +
  'placeholder:text-content-secondary/70 transition-colors focus:outline-none ' +
  'focus:border-stroke-active';

export function Input({ label, hint, error, leading, className, id, ...props }: InputProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label font-medium text-content">
          {label}
        </label>
      )}
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-content-secondary">
            {leading}
          </span>
        )}
        <input
          id={id}
          aria-describedby={describedBy}
          className={cn(
            fieldBase,
            leading ? 'pl-10' : undefined,
            error ? 'border-stroke-active' : 'border-stroke-subtle',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-small text-content">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-small text-content-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Variante de busca: Input com ícone de lupa e cantos arredondados. */
export function SearchInput({ leading, ...props }: InputProps) {
  return (
    <Input
      type="search"
      leading={
        leading ?? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      }
      placeholder={props.placeholder ?? 'Buscar...'}
      {...props}
    />
  );
}
