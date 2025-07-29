'use server'

import { createServerAction } from 'zsa'
import { getDB } from '@/db'
import { requireAdmin } from '@/utils/auth'
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import { invoiceTable, userTable } from '@/db/schema'
import { PAGE_SIZE_OPTIONS } from '../admin-constants'
import { INVOICE_NUMBER_PREFIX } from '@/constants'

const getInvoicesSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z
    .number()
    .min(1)
    .max(Math.max(...PAGE_SIZE_OPTIONS))
    .default(10),
  statusFilter: z.string().optional(),
  emailFilter: z.string().optional(),
})

export const getInvoicesAction = createServerAction()
  .input(getInvoicesSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const { page, pageSize, statusFilter, emailFilter } = input

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build where clause
    let whereClause = undefined
    if (statusFilter || emailFilter) {
      const conditions = []

      if (statusFilter) {
        conditions.push(sql`${invoiceTable.status} = ${statusFilter}`)
      }

      if (emailFilter) {
        conditions.push(sql`${userTable.email} LIKE ${`%${emailFilter}%`}`)
      }

      whereClause =
        conditions.length > 0
          ? sql`${sql.join(conditions, sql` AND `)}`
          : undefined
    }

    // Always use JOIN since we need user data
    const baseQuery = db
      .select({
        id: invoiceTable.id,
        userId: invoiceTable.userId,
        packageId: invoiceTable.packageId,
        numberOfCredits: invoiceTable.numberOfCredits,
        amount: invoiceTable.amount,
        vatAmount: invoiceTable.vatAmount,
        totalAmount: invoiceTable.totalAmount,
        currency: invoiceTable.currency,
        status: invoiceTable.status,
        paymentIntentId: invoiceTable.paymentIntentId,
        vatNumber: invoiceTable.vatNumber,
        country: invoiceTable.country,
        isBusiness: invoiceTable.isBusiness,
        createdAt: invoiceTable.createdAt,
        userEmail: userTable.email,
        userFirstName: userTable.firstName,
        userLastName: userTable.lastName,
      })
      .from(invoiceTable)
      .innerJoin(userTable, sql`${invoiceTable.userId} = ${userTable.id}`)

    // Fetch total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoiceTable)
      .innerJoin(userTable, sql`${invoiceTable.userId} = ${userTable.id}`)
      .where(whereClause)

    // Fetch paginated invoices
    const invoices = await baseQuery
      .where(whereClause)
      .orderBy(sql`${invoiceTable.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset)

    // Transform the data to match our table's expected format
    const transformedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: `${INVOICE_NUMBER_PREFIX}-${invoice.id}`,
      userEmail: invoice.userEmail,
      userName:
        invoice.userFirstName && invoice.userLastName
          ? `${invoice.userFirstName} ${invoice.userLastName}`
          : null,
      packageId: invoice.packageId,
      numberOfCredits: invoice.numberOfCredits,
      amount: invoice.amount,
      vatAmount: invoice.vatAmount,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      status: invoice.status,
      paymentIntentId: invoice.paymentIntentId,
      vatNumber: invoice.vatNumber,
      country: invoice.country,
      isBusiness: invoice.isBusiness,
      createdAt: invoice.createdAt,
    }))

    return {
      invoices: transformedInvoices,
      totalCount: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    }
  })
