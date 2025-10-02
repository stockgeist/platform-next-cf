import { Suspense } from 'react'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { STTDirectClient } from './_components/stt.client'
import { getUserTranscriptions } from '@/server/transcriptions'
import { TranscriptionList } from '@/components/transcriptions/transcription-list'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { Playbar } from '@/components/audio'

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

export default async function STTPage() {
  const session = await getSessionFromCookie()

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: '/stt',
            label: 'Speech-to-Text',
          },
        ]}
      />
      <div className="flex flex-col">
        <div className="px-4 pt-4 pb-8">
          <div className="mb-8">
            <STTDirectClient />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Recent Transcriptions</h2>
              <p className="text-muted-foreground">
                View and manage your recent speech-to-text transcriptions.
              </p>
            </div>

            <Suspense fallback={<TranscriptionListSkeleton />}>
              <TranscriptionListWrapper />
            </Suspense>
          </div>
        </div>
        <Playbar />
      </div>
    </>
  )
}
