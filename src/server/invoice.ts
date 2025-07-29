import 'server-only'

import { getDB } from '@/db'
import { invoiceTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { getCreditPackage } from '@/utils/credits'
import { centsToUnit } from '@/utils/money'

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
  const creditPackage = getCreditPackage(packageId)
  if (!creditPackage) {
    throw new Error('Package not found')
  }

  const [invoice] = await db
    .insert(invoiceTable)
    .values({
      userId,
      packageId,
      numberOfCredits: creditPackage.credits,
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

export async function getInvoiceById(id: number) {
  const db = getDB()

  const [invoice] = await db
    .select()
    .from(invoiceTable)
    .where(eq(invoiceTable.id, id))
    .limit(1)

  return invoice
}

export async function getUserInvoices(userId: string) {
  const db = getDB()

  return db
    .select()
    .from(invoiceTable)
    .where(eq(invoiceTable.userId, userId))
    .orderBy(invoiceTable.createdAt)
}

export async function generateInvoicePDF(
  invoice: typeof invoiceTable.$inferSelect,
) {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a PDF generation library
  // like PDFKit or a service like DocRaptor
  const invoiceDate = format(new Date(invoice.createdAt), 'MMMM d, yyyy')
  const invoiceNumber = `INV-${invoice.id}`

  return {
    invoiceNumber,
    invoiceDate,
    amount: centsToUnit(invoice.amount),
    vatAmount: centsToUnit(invoice.vatAmount),
    totalAmount: centsToUnit(invoice.totalAmount),
    currency: invoice.currency.toUpperCase(),
    vatNumber: invoice.vatNumber,
    country: invoice.country,
    isBusiness: invoice.isBusiness,
  }
}
