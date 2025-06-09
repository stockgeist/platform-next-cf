import { getDB } from '@/db'
import { invoices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import { formatVatAmount } from '@/utils/vat'

interface CreateInvoiceParams {
  userId: string
  packageId: string
  amount: number
  vatAmount: number
  totalAmount: number
  currency: string
  paymentIntentId: string
  vatNumber?: string
  country: string
  isBusiness: boolean
}

export async function createInvoice({
  userId,
  packageId,
  amount,
  vatAmount,
  totalAmount,
  currency,
  paymentIntentId,
  vatNumber,
  country,
  isBusiness,
}: CreateInvoiceParams) {
  const db = getDB()

  const [invoice] = await db
    .insert(invoices)
    .values({
      id: nanoid(),
      userId,
      packageId,
      amount,
      vatAmount,
      totalAmount,
      currency,
      status: 'paid',
      paymentIntentId,
      vatNumber,
      country,
      isBusiness,
    })
    .returning()

  return invoice
}

export async function getInvoiceById(id: string) {
  const db = getDB()

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1)

  return invoice
}

export async function getUserInvoices(userId: string) {
  const db = getDB()

  return db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(invoices.createdAt)
}

export async function generateInvoicePDF(
  invoice: typeof invoices.$inferSelect,
) {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a PDF generation library
  // like PDFKit or a service like DocRaptor
  const invoiceDate = format(new Date(invoice.createdAt), 'MMMM d, yyyy')
  const invoiceNumber = `INV-${invoice.id.slice(0, 8).toUpperCase()}`

  return {
    invoiceNumber,
    invoiceDate,
    amount: formatVatAmount(invoice.amount),
    vatAmount: formatVatAmount(invoice.vatAmount),
    totalAmount: formatVatAmount(invoice.totalAmount),
    currency: invoice.currency.toUpperCase(),
    vatNumber: invoice.vatNumber,
    country: invoice.country,
    isBusiness: invoice.isBusiness,
  }
}
