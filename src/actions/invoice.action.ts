'use server'

import { createServerAction, ZSAError } from 'zsa'
import { z } from 'zod'
import { createInvoice } from '@/server/invoice'
import { requireVerifiedEmail } from '@/utils/auth'

const createInvoiceSchema = z.object({
  packageId: z.string(),
  amount: z.number(),
  vatAmount: z.number(),
  totalAmount: z.number(),
  currency: z.string(),
  paymentIntentId: z.string(),
  vatNumber: z.string().optional(),
  country: z.string(),
  isBusiness: z.boolean(),
})

export const createInvoiceAction = createServerAction()
  .input(createInvoiceSchema)
  .handler(async ({ input }) => {
    const session = await requireVerifiedEmail()

    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    try {
      const invoice = await createInvoice({
        ...input,
        userId: session.user.id,
      })
      return { success: true, data: invoice }
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to create invoice')
    }
  })
