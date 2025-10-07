'use client'
import { deleteTranscriptionAction } from '@/actions/transcription-actions'
import { Button } from '@/components/ui/button'
import { Transcription } from '@/db/schema'
import { Download, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

export function ActionButtons({
  transcription,
}: {
  transcription: Transcription
}) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const { execute: deleteTranscription } = useServerAction(
    deleteTranscriptionAction,
    {
      onSuccess: () => {
        toast.success('Transcription deleted')
      },
      onError: (error) => {
        toast.error('Failed to delete transcription', {
          description: error.err?.message || 'An error occurred',
        })
      },
    },
  )

  // const { load } = useAudioPlayerContext()
  // const { setCurrentAudio } = useAudioStore()
  // const handlePlayTranscription = (transcription: Transcription) => {
  //   if (!transcription.transcriptionText) {
  //     return
  //   }
  //   const url = getFileUrl(transcription.r2Key)
  //   const { fileName } = transcription
  //   setCurrentAudio({
  //     id: transcription.id,
  //     name: fileName,
  //     url,
  //   })
  //   load(url, { autoplay: true })
  // }
  const handleDowloadTextFile = (transcription: Transcription) => {
    if (!transcription.transcriptionText) {
      return
    }
    const blob = new Blob([transcription.transcriptionText], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${transcription.fileName}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    setDeletingIds((prev) => new Set(prev).add(transcription.id))
    await deleteTranscription({ transcriptionId: transcription.id })
    setDeletingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(transcription.id)
      return newSet
    })
  }

  return (
    <div className="flex items-center space-x-2">
      {/* <Button variant="outline" size="sm" asChild>
        <a
          href={`/api/files/${encodeURIComponent(transcription.r2Key)}`}
          download={transcription.fileName}
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </Button> */}
      {/* <Button
        size="sm"
        onClick={() => handlePlayTranscription(transcription)}
        disabled={!transcription.transcriptionText}
      >
        Play
      </Button> */}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDowloadTextFile(transcription)}
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deletingIds.has(transcription.id)}
      >
        {deletingIds.has(transcription.id) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="text-destructive h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
