import { Suspense } from 'react'
import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getUserTtsHistory } from '@/server/tts'
import { TtsHistoryList } from '@/components/tts/tts-history-list'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { PageHeader } from '@/components/page-header'
import { Playbar } from '@/components/audio'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

function TtsHistoryListSkeleton() {
  return (
    <TableSkeleton
      columns={[
        { name: 'Name', width: 'w-48' },
        { name: 'Voice', width: 'w-20' },
        { name: 'Status', width: 'w-16' },
        { name: 'Date', width: 'w-24' },
        { name: 'Actions', align: 'right' },
      ]}
      showSearch={true}
      showHeader={true}
      searchPlaceholder="Search..."
      headerTitle="History"
      actionButtonCount={2}
    />
  )
}

async function TtsHistoryListWrapper() {
  const ttsRecords = await getUserTtsHistory()
  if (ttsRecords.length === 0) {
    redirect('/tts/create')
  }
  return <TtsHistoryList ttsRecords={ttsRecords} />
}

export default async function TtsPage() {
  const session = await getSessionFromCookie()

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: '/tts',
            label: 'Text to speech',
          },
        ]}
        actions={
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Feedback
          </Button>
        }
      />
      <div className="flex h-[calc(100dvh-64px)] flex-col">
        <div className="mx-auto flex h-full w-4xl flex-col p-2">
          <Suspense fallback={<TtsHistoryListSkeleton />}>
            <TtsHistoryListWrapper />
          </Suspense>
        </div>

        <Playbar />
      </div>
    </>
  )
}
