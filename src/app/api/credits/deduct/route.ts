import { NextRequest, NextResponse } from 'next/server'
import {
  authenticateApiRequest,
  deductCreditsFromApiKey,
} from '@/utils/api-auth'
import { z } from 'zod'

const deductCreditsSchema = z.object({
  amount: z.number().positive().int(),
  description: z.string().min(1).max(255),
  service: z.string().min(1).max(100),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate the API request
    const authResult = await authenticateApiRequest()

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      )
    }

    // Parse and validate the request body
    const body = await request.json()
    const validation = deductCreditsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 },
      )
    }

    const { amount, description, service } = validation.data

    // Deduct credits
    const result = await deductCreditsFromApiKey({
      userId: authResult.userId!,
      amount,
      description,
      service,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 },
      )
    }

    return NextResponse.json({
      success: true,
      remainingCredits: result.remainingCredits,
      transactionId: result.transactionId,
    })
  } catch (error) {
    console.error('API credit deduction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
