'use client'

import { cn } from '@/lib/utils'

interface ServingsSelectorProps {
    servings: number
    onChange: (servings: number) => void
    className?: string
}

export function ServingsSelector({ servings, onChange, className }: ServingsSelectorProps) {
    const decrease = () => {
        if (servings > 1) onChange(servings - 1)
    }

    const increase = () => {
        if (servings < 20) onChange(servings + 1)
    }

    return (
        <div className={cn('flex items-center gap-3', className)} data-testid="servings-selector">
            <span className="text-sm font-medium text-muted-foreground">Khẩu phần:</span>
            <div className="flex items-center gap-1 rounded-full border border-border bg-card">
                <button
                    onClick={decrease}
                    disabled={servings <= 1}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                    aria-label="Giảm khẩu phần"
                    data-testid="servings-decrease"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <span className="min-w-[2rem] text-center text-sm font-bold" data-testid="servings-value">
                    {servings}
                </span>
                <button
                    onClick={increase}
                    disabled={servings >= 20}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                    aria-label="Tăng khẩu phần"
                    data-testid="servings-increase"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
