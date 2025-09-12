import { z } from 'zod'

export const sttUploadSchema = z.object({
  audioFile: z.instanceof(File, {
    message: 'Audio file is required',
  }),
})

export const sttTranscribeSchema = z.object({
  r2Key: z.string().min(1, {
    message: 'R2 key is required',
  }),
  language: z.string().min(1, {
    message: 'Language is required',
  }),
})

export type SttUploadInput = z.infer<typeof sttUploadSchema>
export type SttTranscribeInput = z.infer<typeof sttTranscribeSchema>
