import { PageHeader } from '@/components/page-header'
import { InvoicesTable } from './_components/invoices-table'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoice Management',
  description: 'Manage all invoices',
}

export default function AdminInvoicesPage() {
  return (
    <>
      <PageHeader
        items={[
          { href: '/admin', label: 'Admin' },
          { href: '/admin/invoices', label: 'Invoices' },
        ]}
      />
      <InvoicesTable />
    </>
  )
}
