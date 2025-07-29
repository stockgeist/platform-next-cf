// EU VAT rates by country (as of 2024)
export const EU_VAT_RATES: Record<string, number> = {
  AT: 0.2, // Austria
  BE: 0.21, // Belgium
  BG: 0.2, // Bulgaria
  HR: 0.25, // Croatia
  CY: 0.19, // Cyprus
  CZ: 0.21, // Czech Republic
  DK: 0.25, // Denmark
  EE: 0.22, // Estonia
  FI: 0.24, // Finland
  FR: 0.2, // France
  DE: 0.19, // Germany
  GR: 0.24, // Greece
  HU: 0.27, // Hungary
  IE: 0.23, // Ireland
  IT: 0.22, // Italy
  LV: 0.21, // Latvia
  LT: 0.21, // Lithuania
  LU: 0.17, // Luxembourg
  MT: 0.18, // Malta
  NL: 0.21, // Netherlands
  PL: 0.23, // Poland
  PT: 0.23, // Portugal
  RO: 0.19, // Romania
  SK: 0.2, // Slovakia
  SI: 0.22, // Slovenia
  ES: 0.21, // Spain
  SE: 0.25, // Sweden
}

// EU country codes
export const EU_COUNTRIES = Object.keys(EU_VAT_RATES)

// VAT number validation regex (simplified version)
const VAT_NUMBER_REGEX = /^[A-Z]{2}[0-9A-Z]{8,12}$/

export function isValidVatNumber(vatNumber: string): boolean {
  return VAT_NUMBER_REGEX.test(vatNumber)
}

export function calculateVatAmount(
  amount: number,
  country: string,
  isBusiness: boolean,
): number {
  // If it's a business customer or non-EU country, no VAT is applied
  if (isBusiness || !EU_COUNTRIES.includes(country)) {
    return 0
  }

  const vatRate = EU_VAT_RATES[country]
  return amount * vatRate
}

export function calculateVatAmountCents(
  amountCents: number,
  country: string,
  isBusiness: boolean,
): number {
  // If it's a business customer or non-EU country, no VAT is applied
  if (isBusiness || !EU_COUNTRIES.includes(country)) {
    return 0
  }

  const vatRate = EU_VAT_RATES[country]
  return Math.round(amountCents * vatRate)
}

export function calculateTotalWithVat(
  amount: number,
  country: string,
  isBusiness: boolean,
): number {
  const vatAmount = calculateVatAmount(amount, country, isBusiness)
  return amount + vatAmount
}

export function getVatRateForCountry(country: string): number {
  return EU_VAT_RATES[country] || 0
}
