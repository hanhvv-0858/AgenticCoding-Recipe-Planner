'use client'

/**
 * T168: MealBlock - individual meal entry card
 */

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { MealPlanEntryData } from '@/lib/validations/meal-plan'

interface MealBlockProps {
    entry: MealPlanEntryData
    onRemove: (entryId: string) => void
    onToggleComplete: (entryId: string, isCompleted: boolean) => void
    className?: string
}

export function MealBlock({ entry, onRemove, onToggleComplete, className }: MealBlockProps) {
    const isRecipe = !!entry.recipe
    const isNote = !!entry.quick_note

    return (
        <div
            className={cn(
                'group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all',
                entry.is_completed && 'opacity-60',
                className
            )}
            data-testid={`meal-entry-${entry.id}`}
        >
            {/* Completion checkbox */}
            <button
                onClick={() => onToggleComplete(entry.id, !entry.is_completed)}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center"
                data-testid={`meal-complete-${entry.id}`}
            >
                <span className={cn(
                    'flex size-6 items-center justify-center rounded-full border-2 transition-all',
                    entry.is_completed
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-border hover:border-primary'
                )}>
                    {entry.is_completed && (
                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </span>
            </button>

            {/* Recipe thumbnail */}
            {isRecipe && entry.recipe && (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                        src={entry.recipe.cover_image_url}
                        alt={entry.recipe.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                </div>
            )}

            {/* Content */}
            <div className="min-w-0 flex-1">
                {isRecipe && entry.recipe ? (
                    <>
                        <p className={cn(
                            'line-clamp-1 text-sm font-medium',
                            entry.is_completed && 'line-through'
                        )}>
                            {entry.recipe.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {entry.recipe.calories_per_serving && (
                                <span>
                                    {Math.round(entry.recipe.calories_per_serving * entry.servings / (entry.recipe.servings || 1))} kcal
                                </span>
                            )}
                            <span>• {entry.servings} phần</span>
                        </div>
                    </>
                ) : isNote ? (
                    <p className={cn(
                        'line-clamp-2 text-sm',
                        entry.is_completed && 'line-through text-muted-foreground'
                    )}>
                        📝 {entry.quick_note}
                    </p>
                ) : null}
            </div>

            {/* Remove button */}
            <button
                onClick={() => onRemove(entry.id)}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                data-testid={`meal-remove-${entry.id}`}
            >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}
