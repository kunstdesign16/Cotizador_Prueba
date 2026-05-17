import { getCurrentUser } from '@/lib/auth-utils'
import { ProjectHubTabs } from './project-hub-tabs'
import { ArrowLeft, FileText, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function QuoteProjectHubPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    try {
        const { id } = await params
        const user = await getCurrentUser()

        const quote = await (prisma as any).quote.findUnique({
            where: {
                id,
                ...(user?.tenantId ? { tenantId: user.tenantId } : {})
            },
            include: {
                client: true,
                items: { orderBy: { createdAt: 'asc' } },
                seller: true,
            }
        })

        if (!quote) {
            return (
                <div className="min-h-screen bg-[#060e0d] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <p className="text-gray-400">Cotización no encontrada o sin acceso.</p>
                        <Link href="/dashboard">
                            <Button variant="outline">Volver al Dashboard</Button>
                        </Link>
                    </div>
                </div>
            )
        }

        // Determinar industria del tenant
        const tenant = user?.tenantId
            ? await prisma.tenant.findUnique({ where: { id: user.tenantId } })
            : null
        const industry: string = (tenant?.industry as string) || 'retail'

        const serialized = JSON.parse(JSON.stringify(quote))

        const STATUS_MAP: Record<string, { label: string; color: string }> = {
            draft:    { label: 'Borrador',   color: 'bg-gray-700 text-gray-200' },
            approved: { label: 'Aprobada',   color: 'bg-emerald-700 text-emerald-100' },
            rejected: { label: 'Rechazada',  color: 'bg-red-700 text-red-100' },
            replaced: { label: 'Reemplazada',color: 'bg-amber-700 text-amber-100' },
        }
        const statusInfo = STATUS_MAP[quote.status] || STATUS_MAP.draft

        return (
            <div className="min-h-screen bg-[#060e0d] p-4 sm:p-8">
                <div className="mx-auto max-w-6xl space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-emerald-900/20">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-white">{quote.project_name || 'Sin nombre'}</h1>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    {quote.client && (
                                        <span className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" />
                                            {quote.client.name}
                                            {quote.client.company && ` · ${quote.client.company}`}
                                        </span>
                                    )}
                                    <span className="text-gray-700">·</span>
                                    <span>{new Date(quote.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    ${(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Project Hub Tabs */}
                    <ProjectHubTabs quote={serialized} industry={industry} />

                </div>
            </div>
        )
    } catch (error: any) {
        return (
            <div className="min-h-screen bg-[#060e0d] p-8">
                <div className="max-w-lg mx-auto space-y-4">
                    <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6">
                        <h2 className="text-red-400 font-bold text-lg mb-2">Error al cargar el Project Hub</h2>
                        <p className="text-red-300 text-sm font-mono">{error.message}</p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline">← Volver al Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }
}
