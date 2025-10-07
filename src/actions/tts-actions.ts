'use server'

import { createServerAction } from 'zsa'
import { z } from 'zod'
import { ZSAError } from 'zsa'
import { requireVerifiedEmail } from '@/utils/auth'
import { getTtsById, deleteTtsRecord } from '@/server/tts'
import { revalidatePath } from 'next/cache'

// Delete TTS schema
const deleteTtsSchema = z.object({
  ttsId: z.string().min(1, 'TTS ID is required'),
})

// Get TTS by ID schema
const getTtsSchema = z.object({
  ttsId: z.string().min(1, 'TTS ID is required'),
})

/**
 * Delete a TTS record
 */
export const deleteTtsAction = createServerAction()
  .input(deleteTtsSchema)
  .handler(async ({ input }) => {
    try {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
      }

      // First, verify the user owns this TTS record
      const ttsRecord = await getTtsById(input.ttsId)
      if (!ttsRecord) {
        throw new ZSAError('NOT_FOUND', 'TTS record not found')
      }

      if (ttsRecord.userId !== session.user.id) {
        throw new ZSAError(
          'FORBIDDEN',
          'You do not have permission to delete this TTS record',
        )
      }

      await deleteTtsRecord(input.ttsId, session.user.id)
      revalidatePath('/tts')

      return {
        success: true,
        data: {
          deleted: true,
          ttsId: input.ttsId,
        },
      }
    } catch (error) {
      console.error('Failed to delete TTS record:', error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to delete TTS record')
    }
  })

/**
 * Get a specific TTS record by ID
 */
export const getTtsAction = createServerAction()
  .input(getTtsSchema)
  .handler(async ({ input }) => {
    try {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
      }

      const ttsRecord = await getTtsById(input.ttsId)
      if (!ttsRecord) {
        throw new ZSAError('NOT_FOUND', 'TTS record not found')
      }

      // Check if user has access to this TTS record
      if (ttsRecord.userId !== session.user.id) {
        throw new ZSAError(
          'FORBIDDEN',
          'You do not have permission to view this TTS record',
        )
      }

      return {
        success: true,
        data: ttsRecord,
      }
    } catch (error) {
      console.error('Failed to get TTS record:', error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to get TTS record')
    }
  })
