// Junta classes condicionais sem dependência externa (clsx/cva).
// Valores falsy são ignorados; classes posteriores apenas concatenam
// (não há resolução de conflito de Tailwind — manter as listas coesas).
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
