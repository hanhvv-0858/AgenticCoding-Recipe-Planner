/**
 * Cookbook Validation Schemas (T137)
 * Schemas for save/unsave recipe operations
 */

import { z } from 'zod'

/**
 * Schema for saving a recipe
 */
export const saveRecipeSchema = z.object({
    recipeId: z.string().uuid('ID công thức không hợp lệ'),
    notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
})

/**
 * Schema for unsaving a recipe
 */
export const unsaveRecipeSchema = z.object({
    recipeId: z.string().uuid('ID công thức không hợp lệ'),
})

/**
 * Schema for getting saved recipes
 */
export const savedRecipesQuerySchema = z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(50).default(12),
    sortBy: z.enum(['saved_at', 'name', 'rating']).default('saved_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Type for a saved recipe with recipe details
 */
export type SavedRecipeData = {
    recipe_id: string
    saved_at: string
    notes: string | null
    recipe: {
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
}

/**
 * Type for saved recipes list result
 */
export type SavedRecipesResult = {
    recipes: SavedRecipeData[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export type SaveRecipeParams = z.infer<typeof saveRecipeSchema>
export type UnsaveRecipeParams = z.infer<typeof unsaveRecipeSchema>
export type SavedRecipesQueryParams = z.infer<typeof savedRecipesQuerySchema>
