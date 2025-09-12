import { z } from 'zod'
import { checkVAT, countries as vatCountries } from 'jsvat-next'
export const paymentFormSchema = z
  .object({
    // VAT form fields
    isBusiness: z.boolean().default(false),
    vatNumber: z.string().optional(),
    country: z.object({
      alpha2: z.string(),
      alpha3: z.string(),
      name: z.string(),
    }),
    // Computed VAT fields
    vatAmount: z.number().default(0),
    totalAmount: z.number(),
    saveForFuture: z.boolean().default(false),
    address: z.string().min(1, 'Address is required'),
  })
  .refine(
    (data) => {
      // If business customer, VAT number is required
      if (data.isBusiness && !data.vatNumber) {
        return false
      }
      return true
    },
    {
      message: 'VAT number is required for business customers',
      path: ['vatNumber'],
    },
  )
  .refine(
    (data) => {
      // VAT number validation using jsvat-next for business customers
      if (data.isBusiness && data.vatNumber && data.country) {
        const vatResult = checkVAT(data.vatNumber, vatCountries)

        // Check if the VAT number is valid and matches the selected country
        if (!vatResult.isValid) {
          return false
        }

        // Verify the VAT number belongs to the selected country
        if (
          vatResult.country &&
          vatResult.country.isoCode.short !== data.country.alpha2
        ) {
          return false
        }

        return true
      }
      return true
    },
    {
      message: 'Please enter a valid VAT number for the selected country',
      path: ['vatNumber'],
    },
  )

export type PaymentFormData = z.infer<typeof paymentFormSchema>
