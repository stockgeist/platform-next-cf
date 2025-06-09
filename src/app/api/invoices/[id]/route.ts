import { NextResponse } from 'next/server'
import { getInvoiceById, generateInvoicePDF } from '@/services/invoice.service'
import { getSessionFromCookie } from '@/utils/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const invoice = await getInvoiceById(params.id)
    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 })
    }

    // Check if the user owns this invoice
    if (invoice.userId !== session.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const invoiceData = await generateInvoicePDF(invoice)

    // For now, we'll return JSON data
    // In a real implementation, you would generate a PDF and return it
    return NextResponse.json(invoiceData)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
