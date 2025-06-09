// lib/vatValidation.ts
const VIES_API_URL = 'https://viesapi.eu/api'
const VIES_API_KEY = process.env.VIES_API_KEY // Your API key

/**
 * Validates a single VAT number using VIES API
 * @param vatNumber - VAT number to validate (e.g., 'FR12345678901')
 * @returns Validation result with company details if valid
 */
export async function validateVAT(vatNumber: string) {
  try {
    // Clean and format the VAT number
    const cleanVAT = vatNumber.replace(/\s+/g, '').toUpperCase()

    const response = await fetch(
      `${VIES_API_URL}/get/vies/euvat/${encodeURIComponent(cleanVAT)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${btoa(`${VIES_API_KEY}:`)}`,
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.description || 'VAT validation failed')
    }

    const data = await response.json()

    return {
      isValid: data.vies.valid,
      vatNumber: data.vies.vatNumber,
      countryCode: data.vies.countryCode,
      companyName: data.vies.traderName,
      companyAddress: data.vies.traderAddress,
      requestDate: data.vies.date,
    }
  } catch (error) {
    console.error('VAT validation error:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'VAT validation failed',
    }
  }
}
