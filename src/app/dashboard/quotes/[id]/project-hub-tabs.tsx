'use client'

import { useState, useTransition, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    FileText, Truck, DollarSign, Eye, Save, Loader2,
    CheckCircle2, PlusCircle, Calendar, Package, Pencil, X, MapPin, Gauge
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateQuoteLogistics, registerQuotePayment } from '../actions'
import { updateQuote } from '@/actions/quotes'

interface ProjectHubProps {
    quote: any
    industry: string
}

// ─── Tab: Logística / Montaje ────────────────────────────────────────────────
function LogisticsTab({ quote, industry }: { quote: any; industry: string }) {
    const router = useRouter()
    const meta = (quote.metadata as any) || {}
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        deliveryDate:   quote.deliveryDate ? new Date(quote.deliveryDate).toISOString().split('T')[0] : '',
        responsable:    meta.responsable    ?? '',
        transportType:  meta.transportType  ?? '',
        assemblyStatus: meta.assemblyStatus ?? 'PENDING',
        assemblyNotes:  meta.assemblyNotes  ?? '',
    })

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateQuoteLogistics(quote.id, form)
            toast.success('Logística guardada correctamente')
            router.refresh()
        } catch {
            toast.error('Error al guardar logística')
        } finally {
            setSaving(false)
        }
    }

    const ASSEMBLY_STATUSES = [
        { value: 'PENDING',     label: 'Pendiente',     color: 'bg-gray-700' },
        { value: 'IN_TRANSIT',  label: 'En tránsito',   color: 'bg-blue-600' },
        { value: 'ON_SITE',     label: 'En sitio',      color: 'bg-amber-600' },
        { value: 'ASSEMBLED',   label: 'Montado',       color: 'bg-emerald-600' },
        { value: 'COLLECTED',   label: 'Recolectado',   color: 'bg-purple-600' },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha y responsable */}
                <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-500" />
                        {industry === 'rental' ? 'Fechas de Montaje' : 'Fechas de Entrega'}
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">
                                {industry === 'rental' ? 'Fecha de Montaje' : 'Fecha de Entrega'}
                            </Label>
                            <Input type="date" value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">Responsable / Ejecutivo</Label>
                            <Input placeholder="Nombre del responsable" value={form.responsable} onChange={e => set('responsable', e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">Tipo de Transporte</Label>
                            <Input placeholder="Ej: Flota propia, Paquetería, Cliente" value={form.transportType} onChange={e => set('transportType', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Estado de montaje */}
                <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-400" />
                        {industry === 'rental' ? 'Estado de Montaje / Recolección' : 'Estado de Entrega'}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {ASSEMBLY_STATUSES.map(s => (
                            <button
                                key={s.value}
                                onClick={() => set('assemblyStatus', s.value)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                                    form.assemblyStatus === s.value
                                        ? 'border-emerald-500 bg-emerald-900/20'
                                        : 'border-[#1f3630] hover:border-emerald-800'
                                }`}
                            >
                                <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                                <span className={`text-sm font-medium ${form.assemblyStatus === s.value ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                                {form.assemblyStatus === s.value && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
                            </button>
                        ))}
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1.5 block">Observaciones</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-xl border border-[#1f3630] bg-[#060e0d] px-4 py-3 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all"
                            placeholder="Notas de montaje, instrucciones especiales..."
                            value={form.assemblyNotes}
                            onChange={e => set('assemblyNotes', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {saving ? 'Guardando...' : 'Guardar Logística'}
                </Button>
            </div>
        </div>
    )
}

// ─── Tab: Finanzas ───────────────────────────────────────────────────────────
function FinancialsTab({ quote }: { quote: any }) {
    const router = useRouter()
    const meta = (quote.metadata as any) || {}
    const payments: any[] = meta.payments || []
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ amount: '', description: '', paymentMethod: 'TRANSFER', date: new Date().toISOString().split('T')[0] })

    const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
    const balance   = (quote.total || 0) - totalPaid
    const ivaAmount = (quote.iva_amount || 0)

    const handleRegister = async () => {
        const amount = parseFloat(form.amount)
        if (isNaN(amount) || amount <= 0) { toast.error('Monto inválido'); return }
        setSaving(true)
        try {
            await registerQuotePayment(quote.id, { ...form, amount })
            toast.success(`Pago de $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} registrado`)
            setForm({ amount: '', description: '', paymentMethod: 'TRANSFER', date: new Date().toISOString().split('T')[0] })
            setShowForm(false)
            router.refresh()
        } catch {
            toast.error('Error al registrar pago')
        } finally {
            setSaving(false)
        }
    }

    const METHODS: Record<string, string> = { TRANSFER: 'Transferencia', CASH: 'Efectivo', CARD: 'Tarjeta', CHECK: 'Cheque' }

    return (
        <div className="space-y-6">
            {/* Resumen financiero */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Cotizado', value: quote.total || 0, color: 'text-white' },
                    { label: 'Total Cobrado',  value: totalPaid,        color: 'text-emerald-400' },
                    { label: 'Saldo Pendiente',value: balance,          color: balance > 0.01 ? 'text-amber-400' : 'text-emerald-400' },
                ].map(m => (
                    <div key={m.label} className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl p-5 space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{m.label}</p>
                        <p className={`text-2xl font-bold ${m.color}`}>
                            ${m.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                ))}
            </div>

            {/* IVA y desglose */}
            <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl p-5 flex flex-wrap gap-6 text-sm">
                <div><span className="text-gray-500">Subtotal: </span><span className="font-bold text-white">${(quote.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                <div><span className="text-gray-500">IVA ({((quote.iva_rate || 0.16) * 100).toFixed(0)}%): </span><span className="font-bold text-blue-400">${ivaAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                {(quote.isr_amount || 0) > 0 && (
                    <div><span className="text-gray-500">ISR Ret.: </span><span className="font-bold text-red-400">-${(quote.isr_amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                )}
                <div className="ml-auto">
                    <div className="h-2 w-48 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min((totalPaid / (quote.total || 1)) * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{((totalPaid / (quote.total || 1)) * 100).toFixed(1)}% cobrado</p>
                </div>
            </div>

            {/* Historial de pagos */}
            <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f3630]">
                    <h3 className="font-bold text-white flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-500" /> Historial de Pagos</h3>
                    <Button size="sm" onClick={() => setShowForm(v => !v)} className="gap-1.5">
                        <PlusCircle className="h-4 w-4" /> Registrar Pago
                    </Button>
                </div>

                {showForm && (
                    <div className="p-6 border-b border-[#1f3630] bg-emerald-950/10 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">Monto ($)</Label>
                            <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">Descripción</Label>
                            <Input placeholder="Anticipo, Saldo, etc." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">Método</Label>
                            <select className="flex h-11 w-full rounded-xl border border-[#1f3630] bg-[#060e0d] px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                {Object.entries(METHODS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="text-gray-400 text-xs mb-1.5 block">Fecha</Label>
                            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="md:col-span-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button onClick={handleRegister} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? 'Guardando...' : 'Guardar Pago'}
                            </Button>
                        </div>
                    </div>
                )}

                {payments.length === 0 ? (
                    <div className="py-12 text-center text-gray-600">
                        <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Sin pagos registrados. Usa el botón de arriba para agregar uno.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead><tr className="text-xs text-gray-500 uppercase border-b border-[#1f3630]">
                            <th className="p-4 text-left">Fecha</th>
                            <th className="p-4 text-left">Descripción</th>
                            <th className="p-4 text-center">Método</th>
                            <th className="p-4 text-right">Monto</th>
                        </tr></thead>
                        <tbody className="divide-y divide-[#1f3630]">
                            {payments.map((p: any) => (
                                <tr key={p.id} className="hover:bg-emerald-900/5 transition-colors">
                                    <td className="p-4 text-gray-400 text-xs">{new Date(p.date).toLocaleDateString('es-MX')}</td>
                                    <td className="p-4 text-white">{p.description}</td>
                                    <td className="p-4 text-center"><Badge variant="outline" className="text-[10px]">{METHODS[p.paymentMethod] || p.paymentMethod}</Badge></td>
                                    <td className="p-4 text-right font-bold text-emerald-400">${(p.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

// ─── Tab: Vista Previa PDF ───────────────────────────────────────────────────
function PDFPreviewTab({ quote, timestamp }: { quote: any; timestamp: number }) {
    const [loading, setLoading] = useState(false)
    // timestamp en la URL fuerza recarga del iframe tras guardar cambios
    const pdfUrl = `/quotes/${quote.id}/pdf?t=${timestamp}`

    const handleOpen = async () => {
        setLoading(true)
        try {
            const r = await fetch(`/quotes/${quote.id}/pdf`, { method: 'HEAD' })
            if (!r.ok) throw new Error()
            window.open(`/quotes/${quote.id}/pdf`, '_blank')
        } catch {
            toast.error('No se pudo generar el PDF. Verifica que la cotización tenga ítems.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#1f3630] flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><Eye className="h-4 w-4 text-blue-400" /> Vista Previa del Documento</h3>
                    <p className="text-xs text-gray-500 mt-0.5">El PDF refleja el logo y colores configurados en tu marca.</p>
                </div>
                <Button onClick={handleOpen} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-500">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                    {loading ? 'Generando...' : 'Abrir en nueva pestaña'}
                </Button>
            </div>
            <div className="relative" style={{ height: '600px' }}>
                <iframe
                    key={timestamp}
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="Vista previa PDF"
                />
            </div>
        </div>
    )
}

// ─── Tab: Cotización (vista estática + modo edición inline) ─────────────────
function QuoteTab({ quote, industry, onSaved }: { quote: any; industry: string; onSaved: () => void }) {
    const router = useRouter()
    const [editMode, setEditMode] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Construir defaultValues para QuoteForm a partir de la quote actual
    const defaultValues = {
        client:    { name: quote.client?.name || '', company: quote.client?.company || '', email: quote.client?.email || '', phone: quote.client?.phone || '' },
        clientId:  quote.clientId || '',
        project:   { name: quote.project_name || '', date: quote.date?.split('T')[0] || new Date().toISOString().split('T')[0], deliveryDate: quote.deliveryDate?.split('T')[0] || '' },
        items:     (quote.items || []).map((i: any) => ({
            ...i,
            concept:            i.concept            ?? '',
            quantity:           i.quantity            ?? 1,
            internal_unit_cost: i.internal_unit_cost  ?? 0,
            cost_article:       i.cost_article        ?? 0,
            cost_workforce:     i.cost_workforce      ?? 0,
            cost_packaging:     i.cost_packaging      ?? 0,
            cost_transport:     i.cost_transport      ?? 0,
            cost_equipment:     i.cost_equipment      ?? 0,
            cost_other:         i.cost_other          ?? 0,
            profit_margin:      i.profit_margin       ?? 30,
            unit_cost:          i.unit_cost           ?? 0,
            subtotal:           i.subtotal            ?? 0,
            isSubItem:          i.isSubItem           ?? false,
            distance:           i.distance            ?? 0,
            origin:             i.origin              ?? '',
            destination:        i.destination         ?? '',
            startDate:          i.startDate           ?? '',
            endDate:            i.endDate             ?? '',
        })),
        sellerId: quote.sellerId || '',
        isr_rate: quote.isr_rate || 0,
    }

    const handleSaveInline = async (data: any) => {
        const res = await updateQuote(quote.id, data)
        if (res?.success) {
            toast.success('Cotización actualizada')
            setEditMode(false)
            startTransition(() => {
                onSaved()   // bump pdfTimestamp
                router.refresh()
            })
            return res
        }
        toast.error(res?.error || 'Error al guardar')
        return res
    }

    if (editMode) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2"><Pencil className="h-4 w-4 text-emerald-500" /> Editando Cotización</h3>
                    <Button variant="outline" size="sm" onClick={() => setEditMode(false)} className="gap-2 border-gray-700 text-gray-400">
                        <X className="h-4 w-4" /> Cancelar
                    </Button>
                </div>
                {/* QuoteForm inline — usa la action updateQuote directamente */}
                <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-4 italic">Los cambios se guardan y actualizan la Vista Previa del PDF automáticamente.</p>
                    {/* Industria services: info de campos extra */}
                    {industry === 'services' && (
                        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/40 rounded-xl flex items-start gap-3">
                            <Gauge className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-blue-300">
                                <strong>Modo Servicios/Logística:</strong> En los ítems, el campo <strong>Distancia (km)</strong> calcula el subtotal como <em>Distancia × Tarifa/km + Costo Base</em>.
                            </div>
                        </div>
                    )}
                    {isPending && (
                        <div className="flex items-center gap-2 text-sm text-emerald-400 mb-3">
                            <Loader2 className="h-4 w-4 animate-spin" /> Actualizando vista previa...
                        </div>
                    )}
                    {/* Importación dinámica del QuoteForm para evitar bundle size */}
                    <InlineQuoteForm defaultValues={defaultValues} onSave={handleSaveInline} industry={industry} />
                </div>
            </div>
        )
    }

    // ── Vista estática ──────────────────────────────────────────────────────
    return (
        <div className="bg-[#0d1a18] border border-[#1f3630] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500" /> Resumen de Cotización
                </h3>
                <Button size="sm" onClick={() => setEditMode(true)} className="gap-2">
                    <Pencil className="h-4 w-4" /> Editar Inline
                </Button>
            </div>
            <Separator className="bg-[#1f3630]" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                    { label: 'Proyecto', value: quote.project_name || '—' },
                    { label: 'Cliente',  value: quote.client?.name || '—' },
                    { label: 'Fecha',    value: quote.date ? new Date(quote.date).toLocaleDateString('es-MX') : '—' },
                    { label: 'Vendedor', value: quote.seller?.name || 'Sin asignar' },
                ].map(f => (
                    <div key={f.label}>
                        <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                        <p className="text-white font-medium truncate">{f.value}</p>
                    </div>
                ))}
            </div>
            <Separator className="bg-[#1f3630]" />
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="text-xs text-gray-500 uppercase border-b border-[#1f3630]">
                        <th className="py-3 text-left">Concepto</th>
                        {industry === 'services' && <th className="py-3 text-center">Dist. (km)</th>}
                        <th className="py-3 text-center">Cant.</th>
                        <th className="py-3 text-right">Precio Unit.</th>
                        <th className="py-3 text-right">Subtotal</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#1f3630]">
                        {(quote.items || []).map((item: any) => (
                            <tr key={item.id} className="hover:bg-emerald-900/5">
                                <td className="py-3 text-white">
                                    {item.concept || '—'}
                                    {industry === 'services' && item.origin && (
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" />{item.origin} → {item.destination}
                                        </div>
                                    )}
                                </td>
                                {industry === 'services' && <td className="py-3 text-center text-blue-400">{item.distance ?? 0} km</td>}
                                <td className="py-3 text-center text-gray-400">{item.quantity}</td>
                                <td className="py-3 text-right text-gray-300">${(item.unit_cost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                <td className="py-3 text-right font-bold text-emerald-400">${(item.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm pt-2 border-t border-[#1f3630]">
                <div className="text-gray-400">Subtotal: <span className="text-white font-medium">${(quote.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                <div className="text-gray-400">IVA: <span className="text-blue-400 font-medium">${(quote.iva_amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                <div className="text-lg font-bold text-white">Total: <span className="text-emerald-400">${(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
            </div>
        </div>
    )
}

// Mini wrapper que carga QuoteForm de forma dinámica
function InlineQuoteForm({ defaultValues, onSave, industry }: { defaultValues: any; onSave: (d: any) => Promise<any>; industry: string }) {
    // Importamos QuoteForm directamente — ya está en el bundle del proyecto
    const QuoteForm = require('@/components/quote-form').default
    return (
        <QuoteForm
            initialData={defaultValues}
            action={onSave}
            title=""
            industry={industry}
        />
    )
}

// ─── Componente Principal ────────────────────────────────────────────────────
export function ProjectHubTabs({ quote, industry }: ProjectHubProps) {
    const logisticsLabel = industry === 'rental' ? 'Montaje / Recolección' : 'Logística'
    // Timestamp para forzar recarga del iframe del PDF tras guardar
    const [pdfTimestamp, setPdfTimestamp] = useState(() => Date.now())
    const bumpPdf = useCallback(() => setPdfTimestamp(Date.now()), [])

    return (
        <Tabs defaultValue="quote" className="space-y-6">
            <div className="bg-[#060e0d] border border-[#1f3630] rounded-2xl p-1.5 overflow-x-auto">
                <TabsList className="bg-transparent h-auto p-0 flex justify-start gap-1 min-w-max">
                    {[
                        { value: 'quote',      label: 'Cotización',   Icon: FileText   },
                        { value: 'logistics',  label: logisticsLabel, Icon: Truck      },
                        { value: 'financials', label: 'Finanzas',     Icon: DollarSign },
                        { value: 'preview',    label: 'Vista Previa', Icon: Eye        },
                    ].map(({ value, label, Icon }) => (
                        <TabsTrigger key={value} value={value}
                            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-500 hover:text-gray-300 py-2.5 px-5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all">
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            <TabsContent value="quote" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <QuoteTab quote={quote} industry={industry} onSaved={bumpPdf} />
            </TabsContent>

            <TabsContent value="logistics" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <LogisticsTab quote={quote} industry={industry} />
            </TabsContent>

            <TabsContent value="financials" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <FinancialsTab quote={quote} />
            </TabsContent>

            <TabsContent value="preview" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <PDFPreviewTab quote={quote} timestamp={pdfTimestamp} />
            </TabsContent>
        </Tabs>
    )
}
