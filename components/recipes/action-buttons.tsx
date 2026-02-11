'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ActionButtonsProps {
    recipeId: string
    isSaved?: boolean
    onSaveToggle?: () => void
    isSaving?: boolean
    className?: string
}

export function ActionButtons({
    recipeId,
    isSaved = false,
    onSaveToggle,
    isSaving = false,
    className,
}: ActionButtonsProps) {
    return (
        <div className={cn('flex gap-3', className)} data-testid="action-buttons">
            {/* Save button */}
            <button
                onClick={onSaveToggle}
                disabled={isSaving}
                className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                    isSaved
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                )}
                data-testid="save-button"
            >
                {isSaved ? (
                    <svg className="size-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ) : (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                )}
                {isSaved ? 'Đã lưu' : 'Lưu lại'}
            </button>

            {/* Add to meal plan */}
            <Link
                href={`/planner?addRecipe=${recipeId}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                data-testid="add-to-plan-button"
            >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Thêm vào kế hoạch
            </Link>
        </div>
    )
}
