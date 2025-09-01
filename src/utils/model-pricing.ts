import 'server-only'

export type Modality = 'TTS' | 'STT'

const TTS_CREDITS_PER_CHAR = 0.01
const STT_CREDITS_PER_SECOND = 8.3

export function estimateCredits({
  modality,
  // For TTS: number of characters in the text
  // For STT: duration of audio in seconds
  inputSize,
}: {
  modality: Modality
  inputSize: number
}): { credits: number } {
  if (inputSize <= 0) return { credits: 0 }

  let credits: number
  if (modality === 'TTS') {
    // TTS: price based on output text length (characters)
    credits = inputSize * TTS_CREDITS_PER_CHAR
  } else {
    // STT: price based on input audio duration (seconds)
    credits = inputSize * STT_CREDITS_PER_SECOND
  }

  // Round up final credits to avoid undercharging fractional credits
  return { credits: Math.ceil(credits) }
}
