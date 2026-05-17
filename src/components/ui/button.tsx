import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variant === 'default' && "bg-emerald-600 text-white shadow hover:bg-emerald-500",
                    variant === 'outline' && "border border-[#1f3630] bg-transparent shadow-sm hover:bg-emerald-900/10 hover:text-emerald-400",
                    variant === 'ghost' && "hover:bg-emerald-900/10 hover:text-emerald-400",
                    size === 'default' && "h-11 px-6 py-2",
                    size === 'sm' && "h-9 rounded-lg px-4 text-xs",
                    size === 'lg' && "h-12 rounded-xl px-10",
                    size === 'icon' && "h-10 w-10",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
