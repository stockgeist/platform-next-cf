import { z } from 'zod'
import { catchaSchema } from './catcha.schema'

export const signUpSchema = z.object({
  email: z.string().email(),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(255, 'First name must be at most 255 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(255, 'Last name must be at most 255 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(255, 'Password must be at most 255 characters'),
  captchaToken: catchaSchema,
})

export type SignUpSchema = z.infer<typeof signUpSchema>
