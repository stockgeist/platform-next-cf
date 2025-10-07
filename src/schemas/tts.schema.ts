import { z } from 'zod'

export const ttsGenerateSchema = z.object({
  text: z
    .string()
    .min(1, {
      message: 'Text is required',
    })
    .max(5000, {
      message: 'Text must be less than 5000 characters',
    }),
  voice: z.string().min(1, {
    message: 'Voice is required',
  }),
})

export const ttsHistorySchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  teamId: z.string().optional(),
})

export const deleteTtsSchema = z.object({
  ttsId: z.string().min(1, 'TTS ID is required'),
})

export type TtsGenerateInput = z.infer<typeof ttsGenerateSchema>
export type TtsHistoryInput = z.infer<typeof ttsHistorySchema>
export type DeleteTtsInput = z.infer<typeof deleteTtsSchema>
