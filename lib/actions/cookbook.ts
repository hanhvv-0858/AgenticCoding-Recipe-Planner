'use server'

/**
 * Cookbook Server Actions (T140, T141, T142)
 * Server actions for save/unsave/get saved recipes
 */

import {
    saveRecipeSchema,
    unsaveRecipeSchema,
    savedRecipesQuerySchema,
    type SavedRecipesResult,
} from '@/lib/validations/cookbook'
import {
    saveRecipeToDb,
    unsaveRecipeFromDb,
    getSavedRecipes as querySavedRecipes,
    checkIfRecipeSaved as queryCheckSaved,
} from '@/lib/queries/cookbook'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Get authenticated user ID
 */
async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
}

/**
 * T140: Save a recipe to user's cookbook
 */
export async function saveRecipe(
    recipeId: string,
    notes?: string
): Promise<ActionResult<{ saved: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập để lưu công thức' }
        }

        const validated = saveRecipeSchema.parse({ recipeId, notes })
        await saveRecipeToDb(userId, validated.recipeId, validated.notes)

        return { success: true, data: { saved: true } }
    } catch (error) {
        console.error('saveRecipe error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể lưu công thức',
        }
    }
}

/**
 * T141: Remove a recipe from user's cookbook
 */
export async function unsaveRecipe(
    recipeId: string
): Promise<ActionResult<{ saved: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập để bỏ lưu công thức' }
        }

        const validated = unsaveRecipeSchema.parse({ recipeId })
        await unsaveRecipeFromDb(userId, validated.recipeId)

        return { success: true, data: { saved: false } }
    } catch (error) {
        console.error('unsaveRecipe error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể bỏ lưu công thức',
        }
    }
}

/**
 * T142: Get user's saved recipes list
 */
export async function getSavedRecipes(
    page = 1,
    pageSize = 12,
    sortBy: 'saved_at' | 'name' | 'rating' = 'saved_at',
    sortOrder: 'asc' | 'desc' = 'desc'
): Promise<ActionResult<SavedRecipesResult>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập để xem công thức đã lưu' }
        }

        const validated = savedRecipesQuerySchema.parse({
            page,
            pageSize,
            sortBy,
            sortOrder,
        })

        const result = await querySavedRecipes(
            userId,
            validated.page,
            validated.pageSize,
            validated.sortBy,
            validated.sortOrder
        )

        return { success: true, data: result }
    } catch (error) {
        console.error('getSavedRecipes error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải công thức đã lưu',
        }
    }
}

/**
 * Check if a recipe is saved by current user
 */
export async function checkRecipeSaved(
    recipeId: string
): Promise<ActionResult<{ saved: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: true, data: { saved: false } }
        }

        const saved = await queryCheckSaved(userId, recipeId)
        return { success: true, data: { saved } }
    } catch (error) {
        console.error('checkRecipeSaved error:', error)
        return { success: true, data: { saved: false } }
    }
}
