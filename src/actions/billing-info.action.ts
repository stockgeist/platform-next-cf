'use server'

import { getDB } from '@/db'
import { userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { requireVerifiedEmail } from '@/utils/auth'
import { updateAllSessionsOfUser } from '@/utils/kv-session'

// Schema for creating/updating user billing info
const billingInfoSchema = z.object({
  isBusiness: z.boolean(),
  vatNumber: z.string().optional(),
  country: z.string().length(2, 'Country code must be 2 characters'),
  address: z.string().optional(),
})

// No input schema needed for getting user billing info

// Create or update user billing info
export const saveBillingInfo = actionClient
  .inputSchema(billingInfoSchema)
  .action(async ({ parsedInput: data }) => {
    const session = await requireVerifiedEmail()
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const db = getDB()

    try {
      // Update user's billing info
      await db
        .update(userTable)
        .set({
          billingIsBusiness: data.isBusiness,
          billingVatNumber: data.vatNumber,
          billingCountry: data.country,
          billingAddress: data.address,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, session.user.id))
      await updateAllSessionsOfUser(session.user.id)

      return { success: true }
    } catch (error) {
      console.error('Error saving billing info:', error)
      return { error: 'Failed to save billing info' }
    }
  })

// Get user billing info
export const getBillingInfo = actionClient.action(async () => {
  const session = await requireVerifiedEmail()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const db = getDB()

  try {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, session.user.id),
      columns: {
        billingIsBusiness: true,
        billingVatNumber: true,
        billingCountry: true,
        billingAddress: true,
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    return {
      billingInfo: {
        isBusiness: user.billingIsBusiness || false,
        vatNumber: user.billingVatNumber,
        country: user.billingCountry,
        billingAddress: user.billingAddress,
      },
    }
  } catch (error) {
    console.error('Error getting billing info:', error)
    return { error: 'Failed to get billing info' }
  }
})

// Clear user billing info
export const deleteBillingInfo = actionClient.action(async () => {
  const session = await requireVerifiedEmail()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const db = getDB()

  try {
    // Clear user's billing info
    await db
      .update(userTable)
      .set({
        billingIsBusiness: null,
        billingVatNumber: null,
        billingCountry: null,
        billingAddress: null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id))

    return { success: true }
  } catch (error) {
    console.error('Error clearing billing info:', error)
    return { error: 'Failed to clear billing info' }
  }
})
