import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { CreateTeamForm } from '@/components/teams/create-team-form'
import { PageHeader } from '@/components/page-header'

export const metadata = {
  title: 'Create Team',
  description: 'Create a new team for your organization',
}

export default async function CreateTeamPage() {
  // Check if the user is authenticated
  const session = await getSessionFromCookie()

  if (!session) {
    redirect('/sign-in?redirect=/dashboard/teams/create')
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: '/dashboard/teams',
            label: 'Teams',
          },
          {
            href: '/dashboard/teams/create',
            label: 'Create Team',
          },
        ]}
      />
      <div className="container mx-auto px-5 pb-12">
        <div className="mx-auto max-w-xl">
          <div className="mb-8">
            <h1 className="mt-4 text-4xl font-bold">Create a new team</h1>
            <p className="text-muted-foreground mt-2">
              Create a team to collaborate with others on projects and share
              resources.
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <CreateTeamForm />
          </div>
        </div>
      </div>
    </>
  )
}
