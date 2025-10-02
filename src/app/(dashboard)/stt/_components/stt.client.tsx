'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { STTDropzone } from '@/components/stt/stt-dropzone'
import { toast } from 'sonner'
import { ChevronLeft, Copy, Download, Pause, Play } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  type ErrorState,
  ErrorContainer,
} from '@/components/stt/error-container'
import { ProcessingState } from '@/components/stt/processing-state'
import { LiveAudioVisualizer } from '@/components/live-audio-visualizer'
import { CustomSelect } from '@/components/stt/custom-select'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useServerAction } from 'zsa-react'
import { uploadAndTranscribeDirectAction } from '../actions/upload-direct.action'
import toWav from 'audiobuffer-to-wav'
import { useAudioStore } from '@/state/audio'
import { useAudioPlayerContext } from 'react-use-audio-player'

const RECORDING_TIME_LIMIT = 60 * 60 // in seconds
const FILE_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type ErrorType = 'microphone' | 'upload' | 'transcribe'

type STTErrorState = ErrorState & { type: ErrorType }
type AppState =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'transcribed'
  | 'error'

const config = {
  defaultSettings: {
    defaultLanguage: 'lt',
    supportedLanguages: ['lt'],
  },
}

export function STTDirectClient() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [error, setError] = useState<STTErrorState | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [timeRecorded, setTimeRecorded] = useState(0)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    config.defaultSettings?.defaultLanguage || 'en',
  )

  const audioChunks = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMediaQuery('MOBILE')
  const { setCurrentAudio, currentAudio } = useAudioStore()

  const { load } = useAudioPlayerContext()

  const { execute: uploadAndTranscribe, isPending: isProcessing } =
    useServerAction(uploadAndTranscribeDirectAction, {
      onSuccess: async (result) => {
        if (result.data?.success && result.data.data) {
          const { transcription: transcriptionText } = result.data.data
          setTranscription(transcriptionText)
          setAppState('transcribed')
        }
      },
      onError: (error) => {
        const errorMessage = error.err?.message || 'Failed to process audio'
        setAppState('error')
        setError({
          message: errorMessage,
          type: 'transcribe',
        })
        toast.error('Processing Failed', {
          description: errorMessage,
        })
      },
    })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [mediaStream])

  const sendAudioForTranscription = useCallback(
    async (audioFile: File) => {
      try {
        setAppState('processing')
        setError(null)

        // Upload and transcribe in one action (direct server upload)
        await uploadAndTranscribe({
          audioFile,
          language: selectedLanguage,
        })
      } catch (err) {
        // Error handling is done in the useServerAction onError callback
        console.error('Upload/transcription error:', err)
        setAppState('error')
        setError({
          message: 'Failed to process audio',
          type: 'transcribe',
        })
      }
    },
    [uploadAndTranscribe, selectedLanguage],
  )

  const handleFilesDrop = async (files: File[]) => {
    if (!files.length) return

    const file = files[0]
    if (!file) return

    setError(null)
    setTranscription(null)

    const isValidAudioType =
      file.type === 'audio/wav' ||
      file.type === 'audio/x-wav' ||
      file.name.toLowerCase().endsWith('.wav')

    if (!isValidAudioType) {
      toast.error('Please upload a WAV audio file')
      return
    }

    if (file.size > FILE_SIZE_LIMIT) {
      toast.error(
        `File is too large. Maximum size is ${FILE_SIZE_LIMIT / 1024 / 1024}MB.`,
      )
      return
    }

    const url = URL.createObjectURL(file)
    setCurrentAudio({
      id: `upload-${Date.now()}`,
      name: file.name,
      url: url,
    })

    load(url, { format: 'wav' })
    sendAudioForTranscription(file)
  }

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasAudioDevice = devices.some(
        (device) => device.kind === 'audioinput',
      )

      if (!hasAudioDevice) {
        toast.error('No microphone device found')
        return false
      }

      const permission = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      })
      if (permission.state === 'denied') {
        toast.error(
          'Microphone access denied, please enable it in your browser',
        )
        return false
      }

      return true
    } catch {
      toast.error('Unable to check microphone permissions')
      return false
    }
  }

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setTranscription(null)
      setTimeRecorded(0)

      const hasMicrophoneAccess = await checkMicrophonePermission()
      if (!hasMicrophoneAccess) return

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMediaStream(stream)
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
      setAppState('recording')
    } catch (err) {
      let errorMessage = 'Unable to access microphone'

      if (err instanceof Error) {
        if (err.name === 'NotFoundError') {
          errorMessage = 'No microphone found'
        } else if (err.name === 'NotAllowedError') {
          errorMessage =
            'Microphone access denied, please enable it in your browser'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Microphone is busy'
        }
      }

      toast.error(errorMessage)
      setAppState('error')
      setError({
        message: errorMessage,
        type: 'microphone',
      })
    }
  }, [])

  const stopRecording = useCallback(
    (shouldTranscribe = false) => {
      return new Promise<void>((resolve) => {
        if (
          mediaRecorder &&
          (appState === 'recording' || appState === 'paused')
        ) {
          const originalOnStop = mediaRecorder.onstop

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, {
              type: mediaRecorder.mimeType,
            })
            const audioContext = new window.AudioContext()
            const arrayBuffer = await audioBlob.arrayBuffer()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
            const wavArrayBuffer = toWav(audioBuffer)
            const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' })
            // Create audio URL and add to player
            const url = URL.createObjectURL(wavBlob)

            setCurrentAudio({
              id: `recording-${Date.now()}`,
              name: `recording-${Date.now()}.wav`,
              url,
            })
            load(url, { format: 'wav' })

            audioChunks.current = []
            if (mediaStream) {
              mediaStream.getTracks().forEach((track) => track.stop())
            }
            setMediaStream(null)
            setTimeRecorded(0)

            mediaRecorder.onstop = originalOnStop
            resolve()

            if (shouldTranscribe) {
              setTimeout(() => {
                // TODO: maybe better naming?
                const fileName = `recording-${Date.now()}.wav`
                const audioFile = new File([wavBlob], fileName, {
                  type: wavBlob.type || 'audio/wav',
                })
                sendAudioForTranscription(audioFile)
              }, 100)
            }
          }

          mediaRecorder.stop()
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
        } else {
          resolve()
        }
      })
    },
    [mediaRecorder, appState, mediaStream, sendAudioForTranscription],
  )

  const togglePause = useCallback(() => {
    if (mediaRecorder && (appState === 'recording' || appState === 'paused')) {
      if (appState === 'paused') {
        mediaRecorder.resume()
        setAppState('recording')
      } else {
        mediaRecorder.pause()
        setAppState('paused')
      }
    }
  }, [mediaRecorder, appState])

  useEffect(() => {
    if (appState === 'recording') {
      timerRef.current = setInterval(() => {
        setTimeRecorded((prev) => {
          if (prev >= RECORDING_TIME_LIMIT - 1) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [appState, stopRecording])

  const handleAbortClick = () => {
    if (mediaRecorder && (appState === 'recording' || appState === 'paused')) {
      mediaRecorder.stop()
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setError(null)
    setCurrentAudio(null)
    setAppState('idle')
    setTranscription(null)
    setTimeRecorded(0)
    setMediaStream(null)
    setMediaRecorder(null)
    audioChunks.current = []
  }

  const handleCopyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription)
      toast.success('Copied to Clipboard', {
        description: 'Transcription has been copied to your clipboard.',
      })
    }
  }

  const handleDownloadTranscription = () => {
    if (transcription) {
      const blob = new Blob([transcription], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transcription.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Download Started', {
        description: 'Transcription file is being downloaded.',
      })
    }
  }

  const handleStopAndTranscribe = async () => {
    await stopRecording(true)
  }

  const handleClearTranscription = () => {
    setTranscription(null)
    setError(null)
    setCurrentAudio(null)
    setAppState('idle')
  }

  return (
    <div className="flex gap-4">
      {/* TODO: proper height handling */}
      <div className="border-border min-h-[360px] w-full space-y-6">
        {appState !== 'idle' && appState !== 'transcribed' && (
          <Button variant="outline" onClick={handleAbortClick}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {/* Processing State */}
        {appState === 'processing' && (
          <ProcessingState
            message="Uploading and processing your audio..."
            onCancel={handleAbortClick}
            cancelText="Cancel"
          />
        )}

        {/* Upload/Record Section */}
        {appState === 'idle' && (
          <STTDropzone
            onFilesDropAction={handleFilesDrop}
            onRecordClickAction={startRecording}
            onErrorAction={(error) => {
              toast.error(error.message)
            }}
            fileSizeLimit={FILE_SIZE_LIMIT}
          />
        )}

        {/* Recording Controls */}
        {(appState === 'recording' || appState === 'paused') && (
          <div className="flex flex-col items-center space-y-4">
            {mediaRecorder && (
              <LiveAudioVisualizer
                mediaRecorder={mediaRecorder}
                width={isMobile ? 320 : 450}
                barWidth={2}
                gap={1}
                backgroundColor="transparent"
                barColor="#037171"
              />
            )}

            <div className="flex items-center justify-center gap-4">
              <span className="text-muted-foreground">
                {formatTime(timeRecorded)}
              </span>
              <Button onClick={togglePause} className="flex items-center gap-2">
                {appState === 'paused' ? (
                  <>
                    <Play className="h-4 w-4" />
                    Continue
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
              <Button onClick={handleStopAndTranscribe}>Transcribe</Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error &&
          (error.type === 'transcribe' || error.type === 'microphone') && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <ErrorContainer error={error} />
              <Button variant="outline" onClick={handleAbortClick}>
                Try Again
              </Button>
            </div>
          )}

        {/* Transcription Result */}
        {transcription && appState !== 'processing' && !isProcessing && (
          <div className="">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleClearTranscription}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-foreground text-base font-medium">
                  {currentAudio?.name || 'audio-file.wav'}
                </h3>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  className="h-10 w-10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownloadTranscription}
                  className="h-10 w-10"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Transcription Content */}
            <div className="space-y-4">
              <p className="text-foreground text-sm whitespace-pre-wrap">
                {transcription}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <Card className="w-1/5">
        <CardContent className="p-6">
          <CustomSelect
            data={
              config.defaultSettings?.supportedLanguages?.map((language) => ({
                label: language.toUpperCase(),
                value: language,
              })) || []
            }
            label="Select Language"
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
