'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Copy,
  Download,
  Pause,
  Play,
  Upload,
  X,
  FolderOpen,
  MicIcon,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ErrorContainer,
  type ErrorState,
} from '@/components/stt/error-container'
import { ProcessingState } from '@/components/stt/processing-state'
import { LiveAudioVisualizer } from '@/components/live-audio-visualizer'
import { CustomSelect } from '@/components/stt/custom-select'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useServerAction } from 'zsa-react'
import {
  getPresignedUploadUrlAction,
  queueForProcessingAction,
} from '../actions/upload.action'

const RECORDING_TIME_LIMIT = 60 * 60 // in seconds
const FILE_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB
const config = {
  defaultSettings: {
    defaultLanguage: 'lt',
    supportedLanguages: ['lt'],
  },
}

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

export function STTClient() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [error, setError] = useState<STTErrorState | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [timeRecorded, setTimeRecorded] = useState(0)
  const [pendingAudio, setPendingAudio] = useState<{
    blob: Blob
    source: 'record' | 'upload'
    name?: string
    r2Key?: string
    r2Url?: string
  } | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    config.defaultSettings?.defaultLanguage || 'en',
  )

  const audioChunks = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery('MOBILE')

  const { execute: getPresignedUrl, isPending: isGettingUrl } = useServerAction(
    getPresignedUploadUrlAction,
    {
      onSuccess: (result) => {
        if (result.data?.success && result.data.data) {
          // Store the presigned URL data for client-side upload
          setPendingAudio((prev) => {
            if (!prev) return null
            return {
              ...prev,
              r2Key: result.data.data.key,
              r2Url: result.data.data.uploadUrl,
            }
          })

          // Trigger client-side upload
          uploadToR2Client(result.data.data, pendingAudio?.blob)
        }
      },
      onError: (error) => {
        const errorMessage = error.err?.message || 'Failed to get upload URL'
        setError({
          type: 'upload',
          message: errorMessage,
        })
        setAppState('error')
        toast.error('Upload Failed', {
          description: errorMessage,
        })
      },
    },
  )

  const { execute: queueForProcessing, isPending: isQueuing } = useServerAction(
    queueForProcessingAction,
    {
      onSuccess: (result) => {
        if (result.data?.success && result.data.data) {
          setTranscription(result.data.data.transcription)
          setAppState('transcribed')
          toast.success('Transcription Complete', {
            description: 'Your audio has been successfully transcribed.',
          })
        }
      },
      onError: (error) => {
        const errorMessage = error.err?.message || 'Failed to process audio'
        setError({
          type: 'transcribe',
          message: errorMessage,
        })
        setAppState('error')
        toast.error('Processing Failed', {
          description: errorMessage,
        })
      },
    },
  )

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

  // Client-side upload to R2 using presigned URL
  const uploadToR2Client = useCallback(
    async (
      presignedData: {
        uploadUrl: string
        key: string
        fields: Record<string, string>
      },
      blob: Blob | undefined,
    ) => {
      if (!blob) return

      try {
        setAppState('processing')

        const response = await fetch(presignedData.uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': blob.type || 'audio/wav',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to upload to R2')
        }

        // Queue for processing after successful upload
        await queueForProcessing({
          key: presignedData.key,
          language: selectedLanguage,
        })
      } catch (error) {
        console.error('Client upload error:', error)
        setError({
          type: 'upload',
          message: 'Failed to upload file',
        })
        setAppState('error')
      }
    },
    [queueForProcessing, selectedLanguage],
  )

  const sendAudioForTranscription = useCallback(
    async (audioBlob: Blob) => {
      try {
        setAppState('processing')
        setError(null)

        // Convert Blob to File
        const audioFile = new File([audioBlob], 'audio.wav', {
          type: audioBlob.type || 'audio/wav',
        })

        // Set pending audio for upload
        setPendingAudio({
          blob: audioBlob,
          source: 'upload',
          name: audioFile.name,
        })

        // Get presigned URL for client-side upload
        await getPresignedUrl({
          audioFile,
          language: selectedLanguage,
        })
      } catch (err) {
        // Error handling is done in the useServerAction onError callback
        console.error('Upload/transcription error:', err)
      }
    },
    [getPresignedUrl, selectedLanguage],
  )

  const handleFilesDrop = async (files: File[]) => {
    if (!files.length) return

    const file = files[0]
    if (!file) return

    setError(null)
    setTranscription(null)
    setPendingAudio(null)

    const isValidAudioType =
      file.type === 'audio/wav' ||
      file.type === 'audio/x-wav' ||
      file.name.toLowerCase().endsWith('.wav')

    if (!isValidAudioType) {
      setError({ type: 'upload', message: 'Please upload a WAV audio file' })
      return
    }

    if (file.size > FILE_SIZE_LIMIT) {
      setError({
        type: 'upload',
        message: `File is too large. Maximum size is ${FILE_SIZE_LIMIT / 1024 / 1024}MB.`,
      })
      return
    }

    // Create audio URL for preview
    const url = URL.createObjectURL(file)
    setAudioUrl(url)

    // Send for transcription
    sendAudioForTranscription(file)
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files) {
      handleFilesDrop(Array.from(files))
    }
  }

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasAudioDevice = devices.some(
        (device) => device.kind === 'audioinput',
      )

      if (!hasAudioDevice) {
        setError({ type: 'microphone', message: 'No microphone device found' })
        return false
      }

      const permission = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      })
      if (permission.state === 'denied') {
        setError({ type: 'microphone', message: 'Microphone access denied' })
        return false
      }

      return true
    } catch {
      setError({
        type: 'microphone',
        message: 'Unable to check microphone permissions',
      })
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
          errorMessage = 'Microphone access denied'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Microphone is busy'
        }
      }

      setError({ type: 'microphone', message: errorMessage })
      setAppState('error')
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

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, {
              type: 'audio/wav',
            })

            // Create audio URL for preview
            const url = URL.createObjectURL(audioBlob)
            setAudioUrl(url)

            // Set pending audio for upload
            setPendingAudio({
              blob: audioBlob,
              source: 'record',
              name: 'recording.wav',
            })

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
                sendAudioForTranscription(audioBlob)
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

    setPendingAudio(null)
    setError(null)
    setAudioUrl(null)
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

  const clearFile = () => {
    setTranscription(null)
    setPendingAudio(null)
    setError(null)
    setAudioUrl(null)
    setAppState('idle')
  }

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardContent className="pt-6">
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

      {/* Processing State */}
      {(isGettingUrl || isQueuing) && (
        <ProcessingState
          message={
            isGettingUrl
              ? 'Preparing upload...'
              : isQueuing
                ? 'Transcribing your audio...'
                : 'Processing your audio...'
          }
          onCancel={handleAbortClick}
          cancelText="Cancel"
        />
      )}

      {/* Upload/Record Section */}
      {appState === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Audio or Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium">
                Drag and drop your audio file here
              </p>
              <p className="mb-4 text-sm text-gray-500">or</p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Choose File
                </Button>
                <Button
                  onClick={startRecording}
                  className="flex items-center gap-2"
                >
                  <MicIcon className="h-4 w-4" />
                  Record Audio
                </Button>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Supported formats: WAV • Max size:{' '}
                {FILE_SIZE_LIMIT / 1024 / 1024}MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/wav,audio/x-wav"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {error &&
              (error.type === 'upload' || error.type === 'microphone') && (
                <ErrorContainer error={error} />
              )}
          </CardContent>
        </Card>
      )}

      {/* Recording Controls */}
      {(appState === 'recording' || appState === 'paused') && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
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
                <span className="font-mono text-2xl">
                  {formatTime(timeRecorded)}
                </span>
                <Button
                  variant="outline"
                  onClick={togglePause}
                  className="flex items-center gap-2"
                >
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
                <Button variant="outline" onClick={handleAbortClick}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcribe Error */}
      {error && error.type === 'transcribe' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <ErrorContainer error={error} />
              <Button variant="outline" onClick={handleAbortClick}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Result */}
      {transcription &&
        appState !== 'processing' &&
        !isGettingUrl &&
        !isQueuing && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audioUrl && (
                <div className="space-y-2">
                  <Label>Audio Preview</Label>
                  <audio ref={audioRef} controls className="w-full">
                    <source src={audioUrl} type="audio/wav" />
                    <track kind="captions" />
                    Your browser does not support the audio element.
                  </audio>
                  <Button variant="outline" onClick={clearFile} size="sm">
                    Clear File
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label>Transcription</Label>
                <div className="min-h-[200px] rounded-lg border bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap">{transcription}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTranscription}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
