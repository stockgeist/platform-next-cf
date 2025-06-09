import { getSessionFromCookie } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { TransactionHistory } from './_components/transaction-history'
import { CreditPackages } from './_components/credit-packages'
import { InvoiceList } from './_components/invoice-list'

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
            href: '/dashboard',
            label: 'Dashboard',
          },
          {
            href: '/dashboard/billing',
            label: 'Billing',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-8">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Credit Packages</h2>
            <CreditPackages />
          </div>
          <div>
            <h2 className="mb-4 text-xl font-semibold">Invoices</h2>
            <InvoiceList />
          </div>
        </div>
        <div className="mt-4">
          <TransactionHistory />
        </div>
      </div>
    </>
  )
}
