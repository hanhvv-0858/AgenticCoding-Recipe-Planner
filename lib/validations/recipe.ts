import { z } from 'zod'

// Search filters schema
export const recipeSearchSchema = z.object({
    query: z.string().trim().max(200, 'Từ khóa tìm kiếm quá dài').optional(),
    tagSlug: z.string().trim().optional(),
    maxCookingTime: z.number().int().positive().max(480).optional(),
    maxCalories: z.number().int().positive().max(5000).optional(),
    minRating: z.number().min(0).max(5).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(50).default(12),
    sortBy: z.enum(['rating', 'cooking_time', 'calories', 'created_at']).default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type RecipeSearchParams = z.infer<typeof recipeSearchSchema>

// Trending recipes schema
export const trendingRecipesSchema = z.object({
    limit: z.number().int().positive().max(20).default(6),
})

export type TrendingRecipesParams = z.infer<typeof trendingRecipesSchema>

// Tag filter schema
export const tagFilterSchema = z.object({
    tagSlug: z.string().trim().min(1, 'Tag không hợp lệ'),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(50).default(12),
})

export type TagFilterParams = z.infer<typeof tagFilterSchema>

// Recipe card display type (derived from DB row)
export type RecipeCardData = {
    id: string
    name: string
    description: string | null
    cover_image_url: string
    cooking_time_minutes: number
    prep_time_minutes: number | null
    servings: number
    calories_per_serving: number | null
    difficulty_level: 'easy' | 'medium' | 'hard' | null
    rating: number | null
    rating_count: number
    tags: { name: string; slug: string; icon_emoji: string | null }[]
}

// Tag display type
export type TagData = {
    id: string
    name: string
    slug: string
    icon_emoji: string | null
    display_order: number
}

// Search result with pagination
export type RecipeSearchResult = {
    recipes: RecipeCardData[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Recipe detail types (Phase 6)
export type RecipeIngredientData = {
    id: string
    ingredient_id: string
    ingredient_name: string
    quantity: number
    unit: string
    preparation_note: string | null
    is_optional: boolean
    display_order: number
    icon_emoji: string | null
    category: string
}

export type RecipeStepData = {
    id: string
    step_number: number
    instruction: string
    image_url: string | null
    duration_minutes: number | null
}

export type RecipeDetailData = {
    id: string
    name: string
    description: string | null
    cover_image_url: string
    cooking_time_minutes: number
    prep_time_minutes: number | null
    servings: number
    calories_per_serving: number | null
    protein_grams: number | null
    carbs_grams: number | null
    fat_grams: number | null
    difficulty_level: 'easy' | 'medium' | 'hard' | null
    rating: number | null
    rating_count: number
    is_public: boolean
    created_by: string | null
    tags: { name: string; slug: string; icon_emoji: string | null }[]
    ingredients: RecipeIngredientData[]
    steps: RecipeStepData[]
}
