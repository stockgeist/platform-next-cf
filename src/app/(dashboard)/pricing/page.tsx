import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { PricingCards } from './_components/pricing-cards'

export default async function BillingPage() {
  const session = await getSessionFromCookie()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: '/pricing',
            label: 'Pricing',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
        <div className="grid gap-8">
          <PricingCards />
        </div>
      </div>
    </>
  )
}
