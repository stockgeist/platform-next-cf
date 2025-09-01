'use server'

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { withRateLimit } from '@/utils/with-rate-limit'
import { requireVerifiedEmail } from '@/utils/auth'
import { estimateCredits } from '@/utils/model-pricing'
import { consumeCredits } from '@/utils/credits'

const estimateSchema = z.object({
  modality: z.enum(['TTS', 'STT']),
  // For TTS: number of characters in the text
  // For STT: duration of audio in seconds
  inputSize: z.number().positive(),
})

export const estimateModelUsageAction = actionClient
  .inputSchema(estimateSchema)
  .action(async ({ parsedInput }) => {
    return withRateLimit(
      async () => {
        const { credits } = estimateCredits({
          modality: parsedInput.modality,
          inputSize: parsedInput.inputSize,
        })
        return { credits }
      },
      { identifier: 'usage-estimate', limit: 120, windowInSeconds: 60 },
    )
  })

const chargeSchema = z.object({
  modality: z.enum(['TTS', 'STT']),
  // For TTS: number of characters in the text
  // For STT: duration of audio in seconds
  inputSize: z.number().positive(),
  // Optional client-provided idempotency key
  requestId: z.string().min(1).max(100).optional(),
  // Optional metadata for logging in the credit transaction description
  meta: z.record(z.string(), z.string()).optional(),
})

export const chargeModelUsageAction = actionClient
  .inputSchema(chargeSchema)
  .action(async ({ parsedInput }) => {
    return withRateLimit(
      async () => {
        const session = await requireVerifiedEmail()
        if (!session?.user?.id) {
          throw new Error('Unauthorized')
        }

        const { credits } = estimateCredits({
          modality: parsedInput.modality,
          inputSize: parsedInput.inputSize,
        })

        const meta = parsedInput.meta
          ? Object.entries(parsedInput.meta)
              .map(([k, v]) => `${k}=${v}`)
              .join(' ')
          : ''

        const inputUnit = parsedInput.modality === 'TTS' ? 'chars' : 'seconds'
        const descriptionParts = [
          `Usage[${parsedInput.modality}]`,
          `input=${parsedInput.inputSize}${inputUnit}`,
          `credits=${credits}`,
        ]
        if (parsedInput.requestId)
          descriptionParts.push(`req=${parsedInput.requestId}`)
        if (meta) descriptionParts.push(meta)

        await consumeCredits({
          userId: session.user.id,
          amount: credits,
          description: descriptionParts.join(' '),
        })

        return { success: true, creditsCharged: credits }
      },
      { identifier: 'usage-charge', limit: 60, windowInSeconds: 60 },
    )
  })
