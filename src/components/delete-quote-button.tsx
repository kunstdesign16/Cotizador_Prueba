'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteQuote } from '@/actions/quotes'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DeleteQuoteButtonProps {
    id: string
    projectName?: string
    iconOnly?: boolean
    className?: string
}

export default function DeleteQuoteButton({ id, projectName, iconOnly = false, className }: DeleteQuoteButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await deleteQuote(id)
            if (res.success) {
                toast.success('Cotización eliminada', {
                    description: projectName ? `"${projectName}" fue eliminada correctamente.` : 'La cotización fue eliminada.',
                    duration: 4000,
                })
                router.refresh()
            } else {
                toast.error('No se pudo eliminar', {
                    description: res.error || 'Ocurrió un error inesperado.',
                })
            }
        } catch {
            toast.error('Error de conexión', {
                description: 'Verifica tu conexión e intenta de nuevo.',
            })
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    if (showConfirm) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowConfirm(false)}
            >
                <div
                    className="bg-[#0d1a18] border border-red-900/50 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">¿Eliminar cotización?</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
                        </div>
                    </div>

                    {projectName && (
                        <p className="text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2 mb-4 italic">
                            "{projectName}"
                        </p>
                    )}

                    <p className="text-xs text-gray-500 mb-5">
                        Se eliminarán también todos los ítems y registros de disponibilidad asociados.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-[#1f3630]"
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {loading ? 'Eliminando...' : 'Sí, eliminar'}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="ghost"
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowConfirm(true)
            }}
            disabled={loading}
            size={iconOnly ? "icon" : "default"}
            className={cn(
                "text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors",
                className
            )}
            title="Eliminar cotización"
        >
            <Trash2 className={cn("h-4 w-4", !iconOnly && "mr-2")} />
            {!iconOnly && "Eliminar"}
        </Button>
    )
}
