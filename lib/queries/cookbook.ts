/**
 * Cookbook Database Queries (T138, T139)
 * Queries for saved recipes operations
 */

import { createClient } from '@/lib/supabase/server'
import type { SavedRecipeData, SavedRecipesResult } from '@/lib/validations/cookbook'

type RecipeRow = {
    id: string
    name: string
    description: string | null
    cover_image_url: string
    cooking_time_minutes: number
    calories_per_serving: number | null
    difficulty_level: 'easy' | 'medium' | 'hard' | null
    rating: number | null
    servings: number
}

type SavedRecipeRow = {
    user_id: string
    recipe_id: string
    notes: string | null
    saved_at: string
    recipes: RecipeRow
}

/**
 * T138: Get saved recipes for a user with pagination
 */
export async function getSavedRecipes(
    userId: string,
    page = 1,
    pageSize = 12,
    sortBy: 'saved_at' | 'name' | 'rating' = 'saved_at',
    sortOrder: 'asc' | 'desc' = 'desc'
): Promise<SavedRecipesResult> {
    const supabase = await createClient()
    const offset = (page - 1) * pageSize

    // Get total count
    const { count } = await supabase
        .from('saved_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    const total = count ?? 0

    // Build query with proper ordering
    let query = supabase
        .from('saved_recipes')
        .select(`
            user_id,
            recipe_id,
            notes,
            saved_at,
            recipes!inner (
                id,
                name,
                description,
                cover_image_url,
                cooking_time_minutes,
                calories_per_serving,
                difficulty_level,
                rating,
                servings
            )
        `)
        .eq('user_id', userId)

    // Apply sorting
    if (sortBy === 'saved_at') {
        query = query.order('saved_at', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'name') {
        // Sort by recipe name - use saved_at as fallback
        query = query.order('saved_at', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'rating') {
        query = query.order('saved_at', { ascending: sortOrder === 'asc' })
    }

    const { data, error } = await query
        .range(offset, offset + pageSize - 1) as unknown as {
            data: SavedRecipeRow[] | null
            error: { message: string } | null
        }

    if (error) {
        console.error('getSavedRecipes error:', error)
        throw new Error('Không thể tải công thức đã lưu')
    }

    const recipes: SavedRecipeData[] = (data ?? []).map((row) => ({
        recipe_id: row.recipe_id,
        saved_at: row.saved_at,
        notes: row.notes,
        recipe: row.recipes,
    }))

    // Sort by recipe name or rating on client side if needed
    if (sortBy === 'name') {
        recipes.sort((a, b) => {
            const cmp = a.recipe.name.localeCompare(b.recipe.name, 'vi')
            return sortOrder === 'asc' ? cmp : -cmp
        })
    } else if (sortBy === 'rating') {
        recipes.sort((a, b) => {
            const aRating = a.recipe.rating ?? 0
            const bRating = b.recipe.rating ?? 0
            return sortOrder === 'asc' ? aRating - bRating : bRating - aRating
        })
    }

    return {
        recipes,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    }
}

/**
 * T139: Check if a recipe is saved by the current user
 */
export async function checkIfRecipeSaved(
    userId: string,
    recipeId: string
): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .maybeSingle() as unknown as {
            data: { recipe_id: string } | null
            error: { message: string } | null
        }

    if (error) {
        console.error('checkIfRecipeSaved error:', error)
        return false
    }

    return data !== null
}

/**
 * Save a recipe to user's cookbook
 */
export async function saveRecipeToDb(
    userId: string,
    recipeId: string,
    notes?: string
): Promise<void> {
    const supabase = await createClient()

    const { error } = await (supabase
        .from('saved_recipes') as unknown as { upsert: (data: Record<string, unknown>, opts?: Record<string, unknown>) => Promise<{ error: { message: string } | null }> })
        .upsert({
            user_id: userId,
            recipe_id: recipeId,
            notes: notes ?? null,
            saved_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,recipe_id',
        })

    if (error) {
        console.error('saveRecipeToDb error:', error)
        throw new Error('Không thể lưu công thức')
    }
}

/**
 * Remove a recipe from user's cookbook
 */
export async function unsaveRecipeFromDb(
    userId: string,
    recipeId: string
): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

    if (error) {
        console.error('unsaveRecipeFromDb error:', error)
        throw new Error('Không thể bỏ lưu công thức')
    }
}
