import 'server-only'

import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getUserApiKeys, getApiKeyUsageStats } from '@/utils/api-key'
import { ApiKeysList } from './_components/api-keys-list'
import { ApiKeyUsageStats } from './_components/api-key-usage-stats'
import { CreateApiKeyButton } from './_components/create-api-key-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

export default async function ApiKeysPage() {
  const session = await getSessionFromCookie()

  if (!session) {
    return redirect('/sign-in')
  }

  // Fetch data server-side
  const [apiKeys, stats] = await Promise.all([
    getUserApiKeys(session.user.id),
    getApiKeyUsageStats(session.user.id),
  ])

  return (
    <>
      <PageHeader
        items={[
          {
            href: '/dashboard',
            label: 'Dashboard',
          },
          {
            href: '/dashboard/api-keys',
            label: 'API Keys',
          },
        ]}
      />
      <div className="container space-y-8 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access to our services.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>
                    Create and manage API keys for accessing our NLP services.
                  </CardDescription>
                </div>
                <CreateApiKeyButton />
              </CardHeader>
              <CardContent>
                <ApiKeysList initialApiKeys={apiKeys} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ApiKeyUsageStats initialStats={stats} />
          </div>
        </div>
      </div>
    </>
  )
}
