'use client'

import { TtsTextInput } from '@/components/tts/tts-text-input'
import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { useAudioPlayerContext } from 'react-use-audio-player'
import { useAudioStore } from '@/state/audio'

export function TtsStreamingClient() {
  const { setCurrentAudio } = useAudioStore()
  const { load } = useAudioPlayerContext()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateTts = useCallback(
    async (data: { text: string; voice: string }) => {
      setIsGenerating(true)
      toast.loading('Generating Speech', {
        description: 'Streaming audio...',
        id: 'tts-generation',
      })

      try {
        // Create URL with query parameters
        const params = new URLSearchParams({
          text: data.text,
          voice: data.voice,
        })
        const streamUrl = `/api/tts/stream?${params.toString()}`

        // Generate a unique ID for this request
        const ttsId = `tts-${Date.now()}`
        const fileName = `tts-${data.voice}-${ttsId}.wav`

        // Set up the audio track immediately
        setCurrentAudio({
          id: ttsId,
          name: fileName,
          url: streamUrl,
        })

        // Load and play the streaming audio directly
        load(streamUrl, {
          format: 'wav',
          autoplay: true,
          html5: true,
        })

        toast.dismiss('tts-generation')
        toast.success('Speech Generated', {
          description: 'Audio is now playing...',
        })
      } catch (error) {
        console.error('TTS generation error:', error)
        toast.dismiss('tts-generation')
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to generate speech'
        toast.error('Generation Failed', {
          description: errorMessage,
        })
      } finally {
        setIsGenerating(false)
      }
    },
    [load, setCurrentAudio],
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
