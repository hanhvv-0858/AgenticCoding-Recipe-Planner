'use client'

/**
 * T167: DailyTimeline - displays 4 meal blocks for a day
 */

import { cn } from '@/lib/utils'
import { MealBlock } from './meal-block'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealType, type MealPlanEntryData } from '@/lib/validations/meal-plan'

interface DailyTimelineProps {
    entries: MealPlanEntryData[]
    onAddRecipe: (mealType: MealType) => void
    onAddNote: (mealType: MealType) => void
    onRemoveEntry: (entryId: string) => void
    onToggleComplete: (entryId: string, isCompleted: boolean) => void
    className?: string
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function DailyTimeline({
    entries,
    onAddRecipe,
    onAddNote,
    onRemoveEntry,
    onToggleComplete,
    className,
}: DailyTimelineProps) {
    const entriesByType = MEAL_ORDER.reduce((acc, type) => {
        acc[type] = entries.filter(e => e.meal_type === type)
        return acc
    }, {} as Record<MealType, MealPlanEntryData[]>)

    return (
        <div className={cn('space-y-4', className)} data-testid="daily-timeline">
            {MEAL_ORDER.map((mealType) => {
                const mealEntries = entriesByType[mealType]
                return (
                    <div
                        key={mealType}
                        className="rounded-xl border border-border bg-card shadow-sm"
                        data-testid={`meal-slot-${mealType}`}
                    >
                        {/* Meal type header */}
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <span>{MEAL_TYPE_ICONS[mealType]}</span>
                                {MEAL_TYPE_LABELS[mealType]}
                            </h3>
                            {mealEntries.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {mealEntries.length} món
                                </span>
                            )}
                        </div>

                        {/* Entries */}
                        <div className="p-3">
                            {mealEntries.length > 0 ? (
                                <div className="mb-3 space-y-2">
                                    {mealEntries.map(entry => (
                                        <MealBlock
                                            key={entry.id}
                                            entry={entry}
                                            onRemove={onRemoveEntry}
                                            onToggleComplete={onToggleComplete}
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {/* Add buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onAddRecipe(mealType)}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border py-3 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                                    data-testid={`add-recipe-${mealType}`}
                                >
                                    <span>🍳</span> Thêm món
                                </button>
                                <button
                                    onClick={() => onAddNote(mealType)}
                                    className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border px-3 py-3 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                                    data-testid={`add-note-${mealType}`}
                                >
                                    <span>📝</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
