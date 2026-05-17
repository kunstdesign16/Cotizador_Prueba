'use server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function updateQuoteLogistics(quoteId: string, data: {
    deliveryDate?: string
    responsable?: string
    transportType?: string
    assemblyStatus?: string
    assemblyNotes?: string
}) {
    const user = await requireAuth()

    await prisma.quote.update({
        where: { id: quoteId, tenantId: user.tenantId },
        data: {
            deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
            metadata: {
                responsable:    data.responsable    ?? '',
                transportType:  data.transportType  ?? '',
                assemblyStatus: data.assemblyStatus ?? 'PENDING',
                assemblyNotes:  data.assemblyNotes  ?? '',
            }
        }
    })

    revalidatePath(`/dashboard/quotes/${quoteId}`)
    return { success: true }
}

export async function registerQuotePayment(quoteId: string, data: {
    amount: number
    description?: string
    paymentMethod?: string
    date?: string
}) {
    const user = await requireAuth()

    const quote = await prisma.quote.findUnique({
        where: { id: quoteId, tenantId: user.tenantId }
    })
    if (!quote) return { success: false, error: 'Cotización no encontrada' }

    const existing = (quote.metadata as any) || {}
    const payments = existing.payments || []
    payments.push({
        id:            `pay-${Date.now()}`,
        amount:        data.amount,
        description:   data.description   || 'Pago parcial',
        paymentMethod: data.paymentMethod || 'TRANSFER',
        date:          data.date          || new Date().toISOString(),
        createdAt:     new Date().toISOString(),
    })

    // Auto-status: si totalPaid >= total → marcar como "paid"
    const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
    const quoteTotal = (quote as any).total || 0
    const newStatus = totalPaid >= quoteTotal - 0.01 ? 'paid' : (quote as any).status

    await prisma.quote.update({
        where: { id: quoteId },
        data: {
            metadata: { ...existing, payments },
            ...(newStatus === 'paid' ? { status: 'paid' } : {})
        }
    })

    revalidatePath(`/dashboard/quotes/${quoteId}`)
    return { success: true }
}
