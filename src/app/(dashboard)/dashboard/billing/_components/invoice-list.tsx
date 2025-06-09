'use client'

import { useEffect, useState } from 'react'
import { getUserInvoices } from '@/services/invoice.service'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { formatVatAmount } from '@/utils/vat'
import { useSessionStore } from '@/state/session'
import type { Invoice } from '@/db/schema'

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { session } = useSessionStore()

  useEffect(() => {
    async function loadInvoices() {
      if (!session?.user?.id) return

      try {
        const userInvoices = await getUserInvoices(session.user.id)
        setInvoices(userInvoices)
      } catch (error) {
        console.error('Error loading invoices:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoices()
  }, [session?.user?.id])

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) throw new Error('Failed to download invoice')

      const invoiceData = await response.json()

      // For now, we'll just log the invoice data
      // In a real implementation, you would generate and download a PDF
      console.log('Invoice data:', invoiceData)

      // TODO: Implement PDF generation and download
      // const blob = new Blob([pdfData], { type: 'application/pdf' })
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = `invoice-${invoiceData.invoiceNumber}.pdf`
      // document.body.appendChild(a)
      // a.click()
      // window.URL.revokeObjectURL(url)
      // document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  if (isLoading) {
    return <div>Loading invoices...</div>
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No invoices found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Invoice {invoice.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(invoice.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>
                  {format(new Date(invoice.createdAt), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span>${formatVatAmount(invoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT</span>
                <span>${formatVatAmount(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${formatVatAmount(invoice.totalAmount)}</span>
              </div>
              {invoice.vatNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT Number</span>
                  <span>{invoice.vatNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country</span>
                <span>{invoice.country.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span>{invoice.isBusiness ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
