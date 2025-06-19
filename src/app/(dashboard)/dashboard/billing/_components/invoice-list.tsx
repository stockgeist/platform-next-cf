import { getUserInvoices } from '@/server/invoice'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { formatVatAmount } from '@/utils/vat'
import { getSessionFromCookie } from '@/utils/auth'

export async function InvoiceList() {
  const session = await getSessionFromCookie()

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please sign in to view your invoices
          </p>
        </CardContent>
      </Card>
    )
  }

  const invoices = await getUserInvoices(session.userId)

  console.log(invoices)

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
              <form action={`/api/invoices/${invoice.id}`} method="GET">
                <Button variant="outline" size="sm" type="submit">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </form>
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
