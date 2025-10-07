import { Playbar } from '@/components/audio'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { getSessionFromCookie } from '@/utils/auth'
import { MessageCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { STTDirectClient } from '../_components/stt.client'

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
            href: '/stt',
            label: 'Speech to Text',
          },
          {
            href: '/stt/create',
            label: 'Create',
          },
        ]}
        actions={
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Feedback
          </Button>
        }
      />
      <div className="mb-[72px] flex flex-col">
        <div className="px-6 pt-6 pb-8">
          <STTDirectClient />
        </div>
        <Playbar />
      </div>
    </>
  )
}
