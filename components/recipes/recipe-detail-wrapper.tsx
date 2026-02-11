'use client'

/**
 * Wrapper for recipe detail with save functionality
 * Connects useSavedRecipe hook to RecipeDetailClient
 */

import type { RecipeDetailData } from '@/lib/validations/recipe'
import { useUser } from '@/hooks/use-user'
import { useSavedRecipe } from '@/hooks/use-saved-recipe'
import { RecipeDetailClient } from './recipe-detail-client'

interface RecipeDetailWrapperProps {
    recipe: RecipeDetailData
}

export function RecipeDetailWrapper({ recipe }: RecipeDetailWrapperProps) {
    const { isAuthenticated } = useUser()
    const { isSaved, isToggling, toggleSave } = useSavedRecipe(recipe.id, isAuthenticated)

    return (
        <RecipeDetailClient
            recipe={recipe}
            isSaved={isSaved}
            onSaveToggle={toggleSave}
            isSaving={isToggling}
        />
    )
}
