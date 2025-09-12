'use server'

import { createServerAction } from 'zsa'
import { z } from 'zod'
import { ZSAError } from 'zsa'
import { requireVerifiedEmail } from '@/utils/auth'
import {
  getUserTranscriptions,
  getTranscriptionById,
  deleteTranscriptionRecord,
} from '@/server/transcriptions'

// Get user transcriptions schema
const getUserTranscriptionsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: z.enum(['processing', 'completed', 'failed']).optional(),
  teamId: z.string().optional(),
})

// Delete transcription schema
const deleteTranscriptionSchema = z.object({
  transcriptionId: z.string().min(1, 'Transcription ID is required'),
})

// Get transcription by ID schema
const getTranscriptionSchema = z.object({
  transcriptionId: z.string().min(1, 'Transcription ID is required'),
})

/**
 * Get user's transcription history
 */
export const getUserTranscriptionsAction = createServerAction()
  .input(getUserTranscriptionsSchema)
  .handler(async ({ input }) => {
    try {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
      }

      const transcriptions = await getUserTranscriptions()

      return {
        success: true,
        data: {
          transcriptions,
          pagination: {
            limit: input.limit,
            offset: input.offset,
            hasMore: transcriptions.length === input.limit,
          },
        },
      }
    } catch (error) {
      console.error('Failed to get user transcriptions:', error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to get transcriptions',
      )
    }
  })

/**
 * Delete a transcription
 */
export const deleteTranscriptionAction = createServerAction()
  .input(deleteTranscriptionSchema)
  .handler(async ({ input }) => {
    try {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
      }

      // First, verify the user owns this transcription
      const transcription = await getTranscriptionById(input.transcriptionId)
      if (!transcription) {
        throw new ZSAError('NOT_FOUND', 'Transcription not found')
      }

      if (transcription.userId !== session.user.id) {
        throw new ZSAError(
          'FORBIDDEN',
          'You do not have permission to delete this transcription',
        )
      }

      await deleteTranscriptionRecord(input.transcriptionId, session.user.id)

      return {
        success: true,
        data: {
          deleted: true,
          transcriptionId: input.transcriptionId,
        },
      }
    } catch (error) {
      console.error('Failed to delete transcription:', error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to delete transcription',
      )
    }
  })

/**
 * Get a specific transcription by ID
 */
export const getTranscriptionAction = createServerAction()
  .input(getTranscriptionSchema)
  .handler(async ({ input }) => {
    try {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
      }

      const transcription = await getTranscriptionById(input.transcriptionId)
      if (!transcription) {
        throw new ZSAError('NOT_FOUND', 'Transcription not found')
      }

      // Check if user has access to this transcription
      if (transcription.userId !== session.user.id) {
        throw new ZSAError(
          'FORBIDDEN',
          'You do not have permission to view this transcription',
        )
      }

      return {
        success: true,
        data: transcription,
      }
    } catch (error) {
      console.error('Failed to get transcription:', error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to get transcription')
    }
  })
