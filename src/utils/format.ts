export const formatNumber = (
  number: number,
  options?: Intl.NumberFormatOptions,
) => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  return new Intl.NumberFormat(locale, options).format(number)
}
