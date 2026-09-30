/**
 * Formats a Chilean Peso amount with period thousands separators, e.g. $14.536
 */
export function formatCLP(amount: number): string {
  // Chilean format uses dot as thousands separator
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${formatted}`;
}

/**
 * Returns "1 caja" or "X cajas"
 */
export function formatBoxCount(count: number): string {
  return count === 1 ? '1 caja' : `${count} cajas`;
}
