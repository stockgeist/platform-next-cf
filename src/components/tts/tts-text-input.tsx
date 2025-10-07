'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SettingsCard } from '@/components/ui/settings-card'
import { CustomSelect } from '@/components/custom-select'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import {
  TTS_CHARS_LIMIT,
  TTS_EMOTIONS,
  TTS_LANGUAGES,
  TTS_VOICES,
} from '@/constants'
import Link from 'next/link'

interface TtsTextInputProps {
  generateTtsAction: (data: { text: string; voice: string }) => void
  isGenerating: boolean
}

const VOICES = TTS_VOICES
const LANGUAGES = TTS_LANGUAGES
const EMOTIONS = TTS_EMOTIONS

export function TtsTextInput({
  generateTtsAction,
  isGenerating,
}: TtsTextInputProps) {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState(VOICES[0].value)
  const [language, setLanguage] = useState(LANGUAGES[0].value)
  const [emotion, setEmotion] = useState(EMOTIONS[0].value)

  const handleGenerate = useCallback(() => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert to speech')
      return
    }

    if (text.length > TTS_CHARS_LIMIT) {
      toast.error(`Text must be less than ${TTS_CHARS_LIMIT} characters`)
      return
    }

    generateTtsAction({
      text: text.trim(),
      voice,
    })
  }, [text, voice, generateTtsAction])

  const characterCount = text.length
  const isOverLimit = characterCount > TTS_CHARS_LIMIT

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-medium">Generate Speech</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Text Input Section */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Textarea
              id="text-input"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`min-h-[120px] ${
                isOverLimit ? 'border-red-500 focus:border-red-500' : ''
              }`}
              disabled={isGenerating}
            />
            <div className="flex justify-between text-sm">
              <p className="text-muted-foreground">
                {characterCount} / {TTS_CHARS_LIMIT} characters
              </p>
              {isOverLimit && (
                <p className="text-red-500">Character limit exceeded</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim() || isOverLimit}
            className=""
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating speech...
              </>
            ) : (
              'Generate Speech'
            )}
          </Button>
        </div>

        {/* Settings Panel */}
        <div className="w-80">
          <SettingsCard title="Settings">
            {/* Voice Selection */}
            <CustomSelect
              data={VOICES.map((voice) => ({
                ...voice,
                icon: voice.avatar,
                badge: voice.disabled ? 'VIP' : undefined,
              }))}
              label="Voice"
              value={voice}
              onChange={setVoice}
              disabled={isGenerating}
              showBadge={true}
            />

            {/* Language Selection */}
            <CustomSelect
              data={LANGUAGES.map((lang) => ({
                ...lang,
                icon: lang.avatar,
              }))}
              label="Language"
              value={language}
              onChange={setLanguage}
              disabled={isGenerating}
              showBadge={false}
            />

            {/* Emotion Selection */}
            <CustomSelect
              data={EMOTIONS.map((emotion) => ({
                ...emotion,
                icon: emotion.avatar,
              }))}
              label="Emotion"
              value={emotion}
              onChange={setEmotion}
              disabled
              showBadge={false}
            />
          </SettingsCard>
        </div>
      </div>
    </div>
  )
}
