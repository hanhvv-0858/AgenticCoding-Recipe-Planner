/**
 * Meal Plan Validation Schemas (T155)
 * Schemas for meal planning operations
 */

import { z } from 'zod'

export const MealType = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
export type MealType = z.infer<typeof MealType>

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
}

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
}

/**
 * Schema for adding a recipe to meal plan
 */
export const addRecipeToMealPlanSchema = z.object({
    recipeId: z.string().uuid('ID công thức không hợp lệ'),
    mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
    mealType: MealType,
    servings: z.number().int().min(1).max(20).default(2),
})

/**
 * Schema for adding a quick note to meal plan
 */
export const addQuickNoteSchema = z.object({
    quickNote: z.string().min(1, 'Ghi chú không được trống').max(200, 'Ghi chú tối đa 200 ký tự'),
    mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
    mealType: MealType,
})

/**
 * Schema for removing a meal plan entry
 */
export const removeMealPlanEntrySchema = z.object({
    entryId: z.string().uuid('ID mục không hợp lệ'),
})

/**
 * Schema for updating meal plan servings
 */
export const updateMealPlanServingsSchema = z.object({
    entryId: z.string().uuid('ID mục không hợp lệ'),
    servings: z.number().int().min(1).max(20),
})

/**
 * Schema for marking meal as completed
 */
export const markMealCompletedSchema = z.object({
    entryId: z.string().uuid('ID mục không hợp lệ'),
    isCompleted: z.boolean(),
})

/**
 * Schema for getting meal plan
 */
export const getMealPlanSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

/**
 * Type for a meal plan entry with recipe data
 */
export type MealPlanEntryData = {
    id: string
    user_id: string
    recipe_id: string | null
    quick_note: string | null
    meal_date: string
    meal_type: MealType
    servings: number
    is_completed: boolean
    created_at: string
    recipe?: {
        id: string
        name: string
        cover_image_url: string
        cooking_time_minutes: number
        calories_per_serving: number | null
        protein_grams: number | null
        carbs_grams: number | null
        fat_grams: number | null
        servings: number
    } | null
}

/**
 * Daily meal plan grouped by date
 */
export type DailyMealPlan = {
    date: string
    entries: MealPlanEntryData[]
}

/**
 * Daily nutritional summary
 */
export type DailySummary = {
    date: string
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    mealCount: number
}

export type AddRecipeToMealPlanParams = z.infer<typeof addRecipeToMealPlanSchema>
export type AddQuickNoteParams = z.infer<typeof addQuickNoteSchema>
