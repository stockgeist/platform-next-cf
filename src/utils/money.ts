// Utility functions for price conversion (prices are stored in cents)
export function centsToUnit(cents: number): number {
  return cents / 100
}

export function unitToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function displayInCurency(
  cents: number,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    ...options,
  }).format(centsToUnit(cents))
}
