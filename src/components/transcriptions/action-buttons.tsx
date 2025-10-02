'use client'
import { Button } from '@/components/ui/button'
import { useAudioPlayerContext } from 'react-use-audio-player'
import { useAudioStore } from '@/state/audio'
import { Transcription } from '@/db/schema'
import { Download } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { getFileUrl } from '@/utils/files'

export function ActionButtons({
  transcription,
}: {
  transcription: Transcription
}) {
  const { load } = useAudioPlayerContext()
  const { setCurrentAudio } = useAudioStore()
  const handlePlayTranscription = (transcription: Transcription) => {
    if (!transcription.transcriptionText) {
      return
    }
    const url = getFileUrl(transcription.r2Key)
    const { fileName } = transcription
    setCurrentAudio({
      id: transcription.id,
      name: fileName,
      url,
    })
    load(url, { autoplay: true })
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" asChild>
        <a
          href={`/api/files/${encodeURIComponent(transcription.r2Key)}`}
          download={transcription.fileName}
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </Button>
      <Button
        size="sm"
        onClick={() => handlePlayTranscription(transcription)}
        disabled={!transcription.transcriptionText}
      >
        Play
      </Button>

      <Button variant="outline" size="sm">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
