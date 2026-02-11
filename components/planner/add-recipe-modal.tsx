'use client'

/**
 * T169: AddRecipeModal - modal for selecting a recipe to add to meal plan
 */

import * as React from 'react'
import Image from 'next/image'
import { Modal } from '@/components/ui/modal'
import { searchRecipes } from '@/lib/actions/recipes'
import type { RecipeCardData } from '@/lib/validations/recipe'
import type { MealType } from '@/lib/validations/meal-plan'
import { MEAL_TYPE_LABELS } from '@/lib/validations/meal-plan'

interface AddRecipeModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (recipeId: string, servings: number) => void
    mealType: MealType
}

export function AddRecipeModal({
    isOpen,
    onClose,
    onSelect,
    mealType,
}: AddRecipeModalProps) {
    const [query, setQuery] = React.useState('')
    const [recipes, setRecipes] = React.useState<RecipeCardData[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [servings, setServings] = React.useState(2)
    const debounceRef = React.useRef<NodeJS.Timeout>()

    // Search recipes with debounce
    React.useEffect(() => {
        if (!isOpen) return

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true)
            const result = await searchRecipes({
                query: query || undefined,
                pageSize: 10,
                sortBy: 'rating',
            })
            if (result.success) {
                setRecipes(result.data.recipes)
            }
            setIsLoading(false)
        }, query ? 300 : 0)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query, isOpen])

    // Reset on open
    React.useEffect(() => {
        if (isOpen) {
            setQuery('')
            setServings(2)
        }
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Thêm món - ${MEAL_TYPE_LABELS[mealType]}`}
            size="lg"
        >
            <div className="space-y-4" data-testid="add-recipe-modal">
                {/* Search */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm công thức..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                    data-testid="recipe-search-modal"
                    autoFocus
                />

                {/* Servings selector */}
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2">
                    <span className="text-sm text-muted-foreground">Số phần ăn:</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setServings(Math.max(1, servings - 1))}
                            className="flex size-7 items-center justify-center rounded-full border border-border text-sm hover:bg-accent"
                        >
                            -
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">{servings}</span>
                        <button
                            onClick={() => setServings(Math.min(20, servings + 1))}
                            className="flex size-7 items-center justify-center rounded-full border border-border text-sm hover:bg-accent"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Recipe list */}
                <div className="max-h-[40vh] space-y-2 overflow-y-auto" data-testid="recipe-list-modal">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-border p-3">
                                    <div className="size-12 rounded-lg bg-muted" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-4 w-3/4 rounded bg-muted" />
                                        <div className="h-3 w-1/2 rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Không tìm thấy công thức
                        </div>
                    ) : (
                        recipes.map(recipe => (
                            <button
                                key={recipe.id}
                                onClick={() => {
                                    onSelect(recipe.id, servings)
                                    onClose()
                                }}
                                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-all hover:border-primary hover:bg-primary/5"
                                data-testid={`modal-recipe-${recipe.id}`}
                            >
                                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <Image
                                        src={recipe.cover_image_url}
                                        alt={recipe.name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 text-sm font-medium">{recipe.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>🕐 {recipe.cooking_time_minutes} phút</span>
                                        {recipe.calories_per_serving && (
                                            <span>• {recipe.calories_per_serving} kcal</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    )
}
