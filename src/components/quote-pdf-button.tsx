'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface QuotePDFButtonProps {
    quoteId: string
    projectName?: string
    iconOnly?: boolean
    className?: string
}

export default function QuotePDFButton({ quoteId, projectName, iconOnly = false, className }: QuotePDFButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleOpenPDF = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        try {
            const pdfUrl = `/quotes/${quoteId}/pdf`

            // Verificar que el PDF responde antes de abrir pestaña
            const res = await fetch(pdfUrl, { method: 'HEAD' })
            if (!res.ok) throw new Error('PDF no disponible')

            // Abrir en nueva pestaña
            window.open(pdfUrl, '_blank')
        } catch {
            toast.error('No se pudo abrir el PDF', {
                description: 'Verifica que la cotización tenga ítems y vuelve a intentarlo.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size={iconOnly ? "icon" : "default"}
            onClick={handleOpenPDF}
            disabled={loading}
            className={cn(
                "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors",
                className
            )}
            title={`Ver PDF: ${projectName || ''}`}
        >
            {loading ? (
                <Loader2 className={cn("h-4 w-4 animate-spin", !iconOnly && "mr-2")} />
            ) : (
                <FileText className={cn("h-4 w-4", !iconOnly && "mr-2")} />
            )}
            {!iconOnly && "Ver PDF"}
        </Button>
    )
}
