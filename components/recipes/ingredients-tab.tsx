'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatQuantity } from '@/lib/utils/recipe-scaling'
import type { ScaledIngredient } from '@/lib/utils/recipe-scaling'
import { ServingsSelector } from './servings-selector'

interface IngredientsTabProps {
    ingredients: ScaledIngredient[]
    servings: number
    originalServings: number
    onServingsChange: (servings: number) => void
    className?: string
}

export function IngredientsTab({
    ingredients,
    servings,
    originalServings,
    onServingsChange,
    className,
}: IngredientsTabProps) {
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

    const toggleChecked = (id: string) => {
        setCheckedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const checkedCount = checkedIds.size
    const totalCount = ingredients.length

    return (
        <div className={cn('space-y-4', className)} data-testid="ingredients-tab">
            {/* Servings control + progress */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <ServingsSelector
                    servings={servings}
                    onChange={onServingsChange}
                />
                <span className="text-xs text-muted-foreground">
                    {checkedCount}/{totalCount} đã chuẩn bị
                </span>
            </div>

            {servings !== originalServings && (
                <p className="text-xs text-primary">
                    📐 Đã điều chỉnh từ {originalServings} → {servings} phần
                </p>
            )}

            {/* Ingredients list */}
            <ul className="space-y-1" data-testid="ingredients-list">
                {ingredients.map(ingredient => {
                    const isChecked = checkedIds.has(ingredient.id)
                    return (
                        <li key={ingredient.id}>
                            <button
                                onClick={() => toggleChecked(ingredient.id)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                                    isChecked
                                        ? 'bg-primary/5 text-muted-foreground'
                                        : 'hover:bg-accent'
                                )}
                                data-testid={`ingredient-${ingredient.id}`}
                            >
                                {/* Checkbox */}
                                <div className={cn(
                                    'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                                    isChecked
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border'
                                )}>
                                    {isChecked && (
                                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                {/* Emoji */}
                                {ingredient.icon_emoji && (
                                    <span className="text-base">{ingredient.icon_emoji}</span>
                                )}

                                {/* Ingredient name and quantity */}
                                <div className="flex-1">
                                    <span className={cn(
                                        'text-sm font-medium',
                                        isChecked && 'line-through'
                                    )}>
                                        {ingredient.ingredient_name}
                                    </span>
                                    {ingredient.preparation_note && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            ({ingredient.preparation_note})
                                        </span>
                                    )}
                                    {ingredient.is_optional && (
                                        <span className="ml-1 text-xs italic text-muted-foreground">
                                            - tùy chọn
                                        </span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <span className={cn(
                                    'shrink-0 text-sm tabular-nums',
                                    isChecked ? 'text-muted-foreground' : 'font-medium text-primary'
                                )}>
                                    {formatQuantity(ingredient.scaled_quantity)} {ingredient.unit}
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
