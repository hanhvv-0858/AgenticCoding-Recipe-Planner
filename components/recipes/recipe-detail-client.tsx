'use client'

import { useState, useMemo } from 'react'
import type { RecipeDetailData } from '@/lib/validations/recipe'
import { scaleRecipeIngredients } from '@/lib/utils/recipe-scaling'
import { RecipeHeader } from './recipe-header'
import { QuickInfo } from './quick-info'
import { TabSwitcher } from './tab-switcher'
import { IngredientsTab } from './ingredients-tab'
import { InstructionsTab } from './instructions-tab'
import { ActionButtons } from './action-buttons'
import { Badge } from '@/components/ui/badge'

interface RecipeDetailClientProps {
    recipe: RecipeDetailData
    isSaved?: boolean
    onSaveToggle?: () => void
    isSaving?: boolean
}

export function RecipeDetailClient({
    recipe,
    isSaved = false,
    onSaveToggle,
    isSaving = false,
}: RecipeDetailClientProps) {
    const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients')
    const [servings, setServings] = useState(recipe.servings)

    const scaledIngredients = useMemo(
        () => scaleRecipeIngredients(recipe.ingredients, recipe.servings, servings),
        [recipe.ingredients, recipe.servings, servings]
    )

    return (
        <div className="pb-24" data-testid="recipe-detail">
            {/* Header with image */}
            <RecipeHeader
                name={recipe.name}
                coverImageUrl={recipe.cover_image_url}
            />

            {/* Content */}
            <div className="container mx-auto space-y-4 px-4 py-4">
                {/* Description */}
                {recipe.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {recipe.description}
                    </p>
                )}

                {/* Tags */}
                {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2" data-testid="recipe-tags">
                        {recipe.tags.map(tag => (
                            <Badge key={tag.slug} variant="secondary">
                                {tag.icon_emoji && <span className="mr-1">{tag.icon_emoji}</span>}
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Quick Info */}
                <QuickInfo
                    cookingTimeMinutes={recipe.cooking_time_minutes}
                    prepTimeMinutes={recipe.prep_time_minutes}
                    caloriesPerServing={recipe.calories_per_serving}
                    rating={recipe.rating}
                    ratingCount={recipe.rating_count}
                    difficultyLevel={recipe.difficulty_level}
                />

                {/* Action Buttons */}
                <ActionButtons
                    recipeId={recipe.id}
                    isSaved={isSaved}
                    onSaveToggle={onSaveToggle}
                    isSaving={isSaving}
                />

                {/* Tab Switcher */}
                <TabSwitcher
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    ingredientCount={recipe.ingredients.length}
                    stepCount={recipe.steps.length}
                />

                {/* Tab Content */}
                {activeTab === 'ingredients' ? (
                    <IngredientsTab
                        ingredients={scaledIngredients}
                        servings={servings}
                        originalServings={recipe.servings}
                        onServingsChange={setServings}
                    />
                ) : (
                    <InstructionsTab steps={recipe.steps} />
                )}
            </div>

            {/* Start Cooking button (fixed at bottom) */}
            <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-sm sm:bottom-0" data-testid="start-cooking-bar">
                <button
                    className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]"
                    data-testid="start-cooking-button"
                >
                    👨‍🍳 Bắt đầu nấu
                </button>
            </div>
        </div>
    )
}
