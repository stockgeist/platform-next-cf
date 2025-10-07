'use client'

import { TtsTextInput } from '@/components/tts/tts-text-input'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { generateTtsAction } from '../actions/generate-tts.action'
import { useCallback, useEffect } from 'react'
import { useAudioPlayerContext } from 'react-use-audio-player'
import { useAudioStore } from '@/state/audio'

export function TtsClient() {
  const { setCurrentAudio } = useAudioStore()

  const { load } = useAudioPlayerContext()
  const { execute: generateTts, isPending: isGenerating } = useServerAction(
    generateTtsAction,
    {
      onSuccess: (result) => {
        if (result.data?.success && result.data.data) {
          const { ttsId, fileName, file } = result.data.data

          // Create blob URL for immediate playback
          const blobUrl = URL.createObjectURL(file)

          setCurrentAudio({
            id: ttsId,
            name: fileName,
            url: blobUrl,
          })

          // Load and play immediately
          load(blobUrl, {
            format: 'wav',
            autoplay: true,
          })

          toast.success('Speech Generated', {
            description: 'Audio is ready for playback',
          })
        }
      },
      onError: (error) => {
        const errorMessage = error.err?.message || 'Failed to generate speech'
        toast.error('Generation Failed', {
          description: errorMessage,
        })
      },
    },
  )

  const handleGenerateTts = useCallback(
    async (data: { text: string; voice: string }) => {
      await generateTts(data)
    },
    [generateTts],
  )

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      const currentAudio = useAudioStore.getState().currentAudio
      if (currentAudio?.url && currentAudio.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio.url)
      }
    }
  }, [])

  return (
    <TtsTextInput
      generateTtsAction={handleGenerateTts}
      isGenerating={isGenerating}
    />
  )
}
