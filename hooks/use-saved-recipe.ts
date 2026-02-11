'use client'

/**
 * T144: Custom hook for saved recipe state management
 * Provides optimistic UI updates for save/unsave actions
 */

import * as React from 'react'
import {
    saveRecipe,
    unsaveRecipe,
    checkRecipeSaved,
} from '@/lib/actions/cookbook'

interface UseSavedRecipeReturn {
    isSaved: boolean
    isLoading: boolean
    isToggling: boolean
    toggleSave: () => Promise<void>
}

export function useSavedRecipe(recipeId: string, isAuthenticated: boolean): UseSavedRecipeReturn {
    const [isSaved, setIsSaved] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isToggling, setIsToggling] = React.useState(false)

    // Check initial saved state
    React.useEffect(() => {
        if (!isAuthenticated) {
            setIsSaved(false)
            setIsLoading(false)
            return
        }

        let cancelled = false
        async function check() {
            const result = await checkRecipeSaved(recipeId)
            if (!cancelled && result.success) {
                setIsSaved(result.data.saved)
            }
            if (!cancelled) {
                setIsLoading(false)
            }
        }
        check()
        return () => { cancelled = true }
    }, [recipeId, isAuthenticated])

    const toggleSave = React.useCallback(async () => {
        if (isToggling || !isAuthenticated) return

        setIsToggling(true)
        // Optimistic update
        const previousState = isSaved
        setIsSaved(!isSaved)

        try {
            const result = isSaved
                ? await unsaveRecipe(recipeId)
                : await saveRecipe(recipeId)

            if (!result.success) {
                // Revert on failure
                setIsSaved(previousState)
                console.error('Toggle save failed:', result.error)
            }
        } catch {
            // Revert on error
            setIsSaved(previousState)
        } finally {
            setIsToggling(false)
        }
    }, [recipeId, isSaved, isToggling, isAuthenticated])

    return { isSaved, isLoading, isToggling, toggleSave }
}
