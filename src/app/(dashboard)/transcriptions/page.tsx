import { Suspense } from 'react'
import { getUserTranscriptions } from '@/server/transcriptions'
import { TranscriptionList } from '@/components/transcriptions/transcription-list'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function TranscriptionListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function TranscriptionListWrapper() {
  const transcriptions = await getUserTranscriptions()
  return <TranscriptionList transcriptions={transcriptions} />
}

export default function TranscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transcriptions</h1>
        <p className="text-muted-foreground">
          View and manage your speech-to-text transcriptions.
        </p>
      </div>

      <Suspense fallback={<TranscriptionListSkeleton />}>
        <TranscriptionListWrapper />
      </Suspense>
    </div>
  )
}
