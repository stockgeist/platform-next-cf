import { Suspense } from 'react'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getUserTranscriptions } from '@/server/transcriptions'
import { TranscriptionList } from '@/components/transcriptions/transcription-list'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { PageHeader } from '@/components/page-header'
import { Playbar } from '@/components/audio'

function TranscriptionListSkeleton() {
  return (
    <TableSkeleton
      columns={[
        { name: 'File Name', width: 'w-48' },
        { name: 'Status', width: 'w-16' },
        { name: 'Date', width: 'w-24' },
        { name: 'Actions', align: 'right' },
      ]}
      showSearch={true}
      showHeader={false}
      searchPlaceholder="Search..."
      actionButtonCount={2}
    />
  )
}

async function TranscriptionListWrapper() {
  const transcriptions = await getUserTranscriptions()
  if (transcriptions.length === 0) {
    redirect('/stt/create')
  }
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
            label: 'Speech to Text',
          },
        ]}
      />
      <div className="flex h-[calc(100dvh-64px)] flex-col">
        <div className="mx-auto flex h-full w-5xl flex-col p-2">
          <Suspense fallback={<TranscriptionListSkeleton />}>
            <TranscriptionListWrapper />
          </Suspense>
        </div>

        <Playbar />
      </div>
    </>
  )
}
