import { cn } from './cn';

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  /** Índice do passo atual (0-based). Passos anteriores ficam concluídos. */
  current: number;
}

/**
 * Stepper / Pending + Active — usado no fluxo de criação de personagem.
 * Estados: concluído, ativo e pendente.
 */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'pending';
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-small font-semibold',
                state === 'active' && 'border-stroke-active bg-content text-content-inverse',
                state === 'done' && 'border-stroke bg-accent text-content',
                state === 'pending' && 'border-stroke-subtle bg-surface text-content-secondary',
              )}
            >
              {state === 'done' ? '✓' : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-small sm:inline',
                state === 'pending' ? 'text-content-secondary' : 'text-content',
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 hidden h-px flex-1 bg-stroke-subtle sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
