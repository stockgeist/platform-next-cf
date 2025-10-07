'use client'

import { Button } from '@/components/ui/button'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import type { Transcription } from '@/db/schema'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { StatusBadge } from '../ui/status-badge'
import { ActionButtons } from './action-buttons'

interface TranscriptionListProps {
  transcriptions: Transcription[]
}

// function TranscriptionTextDialog({
//   transcription,
// }: {
//   transcription: Transcription
// }) {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Eye className="mr-2 h-4 w-4" />
//           View Text
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>{transcription.fileName}</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           {transcription.transcriptionText ? (
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium">Transcription:</h4>
//               <div className="bg-muted rounded-md p-4">
//                 <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                   {transcription.transcriptionText}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="py-8 text-center">
//               <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
//               <p className="text-muted-foreground">
//                 No transcription available
//               </p>
//             </div>
//           )}

//           {transcription.errorMessage && (
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium text-red-600">Error:</h4>
//               <div className="rounded-md border border-red-200 bg-red-50 p-4">
//                 <p className="text-sm text-red-600">
//                   {transcription.errorMessage}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

export function TranscriptionList({ transcriptions }: TranscriptionListProps) {
  const columns: DataTableColumn<Transcription>[] = [
    {
      key: 'fileName',
      label: 'File Name',
      render: (transcription) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{transcription.fileName}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (transcription) => <StatusBadge status={transcription.status} />,
    },
    {
      key: 'date',
      label: 'Date',
      render: (transcription) =>
        formatDistanceToNow(new Date(transcription.createdAt), {
          addSuffix: true,
        }),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (transcription) => (
        <div className="flex items-center justify-end space-x-2">
          {/* <TranscriptionTextDialog transcription={transcription} /> */}
          <ActionButtons transcription={transcription} />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={transcriptions}
      columns={columns}
      searchFields={['fileName']}
      searchPlaceholder="Search..."
      emptyMessage="No transcriptions found."
      actionButton={
        <Button>
          <Link href="/stt/create">Generate Speech</Link>
        </Button>
      }
    />
  )
}
