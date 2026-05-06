export function formatArs(value: number | undefined | null): string {
  if (value == null || isNaN(Number(value))) return '-';
  return `$${Number(value).toLocaleString('es-AR')}`;
}
