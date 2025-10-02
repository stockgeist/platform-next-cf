import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Transcription } from '@/db/schema'
import { formatFileSize } from '@/utils/format'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react'
import { ActionButtons } from './action-buttons'

interface TranscriptionListProps {
  transcriptions: Transcription[]
}

export function TranscriptionList({ transcriptions }: TranscriptionListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Processing
          </Badge>
        )
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatLanguage = (language: string) => {
    const languageMap: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
    }
    return languageMap[language] || language.toUpperCase()
  }

  if (transcriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No transcriptions yet</h3>
          <p className="text-muted-foreground text-center">
            Upload an audio file to get started with speech-to-text
            transcription.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transcriptions.map((transcription) => (
        <Card
          key={transcription.id}
          className="transition-shadow hover:shadow-md"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(transcription.status)}
                <div>
                  <CardTitle className="text-lg">
                    {transcription.fileName}
                  </CardTitle>
                  <div className="mt-1 flex items-center space-x-2">
                    {getStatusBadge(transcription.status)}
                    <span className="text-muted-foreground text-sm">
                      {formatLanguage(transcription.language)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatFileSize(transcription.fileSize)}
                    </span>
                  </div>
                </div>
              </div>
              <ActionButtons transcription={transcription} />
            </div>
          </CardHeader>

          {transcription.transcriptionText && (
            <>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Transcription:
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {transcription.transcriptionText}
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {transcription.errorMessage && (
            <>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600">Error:</h4>
                  <p className="text-sm text-red-600">
                    {transcription.errorMessage}
                  </p>
                </div>
              </CardContent>
            </>
          )}

          <Separator />
          <CardContent className="pt-3 pb-4">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                Created{' '}
                {formatDistanceToNow(new Date(transcription.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {transcription.processedAt && (
                <span>
                  Processed{' '}
                  {formatDistanceToNow(new Date(transcription.processedAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
