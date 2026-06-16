import type { ReactNode } from 'react';
import { cn } from './cn';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  children?: ReactNode;
}

/**
 * Tabs / Default + Active. A aba ativa usa borda inferior de 3px
 * (border/width-active).
 */
export function Tabs({ tabs, active, onChange, children }: TabsProps) {
  return (
    <div>
      <div role="tablist" className="flex gap-6 border-b border-stroke-subtle">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                '-mb-px border-b-[3px] px-1 pb-3 pt-2 text-body transition-colors',
                isActive
                  ? 'border-stroke-active font-semibold text-content'
                  : 'border-transparent text-content-secondary hover:text-content',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {children && <div className="pt-5">{children}</div>}
    </div>
  );
}
