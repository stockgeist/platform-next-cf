'use client'

import { deleteTtsAction } from '@/actions/tts-actions'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import { TTS_VOICES } from '@/constants'
import { formatDistanceToNow } from 'date-fns'
import { Download, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

interface TtsRecord {
  id: string
  text: string
  voice: string
  fileName: string | null
  r2Key: string | null
  status: 'processing' | 'completed' | 'failed'
  errorMessage: string | null
  createdAt: Date
  processedAt: Date | null
}

interface TtsHistoryListProps {
  ttsRecords: TtsRecord[]
}

// function TtsTextDialog({ record }: { record: TtsRecord }) {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Eye className="mr-2 h-4 w-4" />
//           View Text
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
//         <DialogHeader>
//           <DialogTitle>{record.fileName ?? 'TTS Audio'}</DialogTitle>
//         </DialogHeader>
//         <div className="flex-1 space-y-4 overflow-y-auto">
//           {record.text ? (
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium">Input Text:</h4>
//               <div className="bg-muted max-h-96 overflow-y-auto rounded-md p-4">
//                 <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                   {record.text}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="py-8 text-center">
//               <Volume2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
//               <p className="text-muted-foreground">No text available</p>
//             </div>
//           )}

//           {record.errorMessage && (
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium text-red-600">Error:</h4>
//               <div className="max-h-32 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-4">
//                 <p className="text-sm text-red-600">{record.errorMessage}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

function TtsActionButtons({ record }: { record: TtsRecord }) {
  // const { setCurrentAudio } = useAudioStore()
  // const { load } = useAudioPlayerContext()
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const { execute: deleteTts } = useServerAction(deleteTtsAction, {
    onSuccess: () => {
      toast.success('TTS record deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete TTS record', {
        description: error.err?.message || 'An error occurred',
      })
    },
  })

  // const handlePlayAudio = async () => {
  //   if (!record.r2Key || record.status !== 'completed') {
  //     toast.error('Audio not available')
  //     return
  //   }

  //   try {
  //     const audioUrl = `/api/files/${encodeURIComponent(record.r2Key)}`
  //     setCurrentAudio({
  //       id: record.id,
  //       name: record.fileName ?? 'tts-audio.wav',
  //       url: audioUrl,
  //     })
  //     load(audioUrl, { format: 'wav', autoplay: true })
  //   } catch {
  //     toast.error('Failed to load audio')
  //   }
  // }

  const handleDelete = async () => {
    setDeletingIds((prev) => new Set(prev).add(record.id))
    await deleteTts({ ttsId: record.id })
    setDeletingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(record.id)
      return newSet
    })
  }

  return (
    <div className="flex items-center space-x-2">
      {record.status === 'completed' && record.r2Key && (
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/api/files/${encodeURIComponent(record.r2Key)}`}
            download={record.fileName ?? 'tts-audio.wav'}
          >
            <Download className="h-4 w-4" />
          </Link>
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deletingIds.has(record.id)}
      >
        {deletingIds.has(record.id) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="text-destructive h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export function TtsHistoryList({ ttsRecords }: TtsHistoryListProps) {
  const formatVoiceName = (voice: string) => {
    return TTS_VOICES.find((v) => v.value === voice)?.label
  }

  const columns: DataTableColumn<TtsRecord>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (record) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {record.text.substring(0, 30) + '...'}
          </span>
        </div>
      ),
    },
    {
      key: 'voice',
      label: 'Voice',
      render: (record) => (
        <span className="text-muted-foreground text-sm">
          {formatVoiceName(record.voice)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: 'date',
      label: 'Date',
      render: (record) =>
        formatDistanceToNow(new Date(record.createdAt), {
          addSuffix: true,
        }),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (record) => (
        <div className="flex items-center justify-end space-x-2">
          <TtsActionButtons record={record} />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={ttsRecords}
      columns={columns}
      searchFields={['text', 'fileName']}
      searchPlaceholder="Search TTS records..."
      emptyMessage="No TTS records found."
      headerTitle="History"
      actionButton={
        <Button>
          <Link href="/tts/create">Generate Speech</Link>
        </Button>
      }
    />
  )
}
