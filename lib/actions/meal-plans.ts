'use server'

/**
 * Meal Plan Server Actions (T159-T165)
 * Server actions for meal planning operations
 */

import {
    addRecipeToMealPlanSchema,
    addQuickNoteSchema,
    removeMealPlanEntrySchema,
    updateMealPlanServingsSchema,
    markMealCompletedSchema,
    getMealPlanSchema,
    type MealPlanEntryData,
    type DailySummary,
} from '@/lib/validations/meal-plan'
import {
    getMealPlan as queryMealPlan,
    getDailySummaries as queryDailySummaries,
    getNextUpcomingMeal as queryNextMeal,
    addRecipeToMealPlanDb,
    addQuickNoteToMealPlanDb,
    removeMealPlanEntryDb,
    updateMealPlanServingsDb,
    markMealCompletedDb,
} from '@/lib/queries/meal-plans'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
}

/**
 * T159: Get meal plan for a date range
 */
export async function getMealPlan(
    startDate: string,
    endDate: string
): Promise<ActionResult<MealPlanEntryData[]>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập để xem kế hoạch bữa ăn' }
        }

        const validated = getMealPlanSchema.parse({ startDate, endDate })
        const data = await queryMealPlan(userId, validated.startDate, validated.endDate)
        return { success: true, data }
    } catch (error) {
        console.error('getMealPlan error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải kế hoạch bữa ăn',
        }
    }
}

/**
 * T160: Add a recipe to meal plan
 */
export async function addRecipeToMealPlan(
    recipeId: string,
    mealDate: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    servings = 2
): Promise<ActionResult<MealPlanEntryData>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập để lập kế hoạch bữa ăn' }
        }

        const validated = addRecipeToMealPlanSchema.parse({
            recipeId,
            mealDate,
            mealType,
            servings,
        })

        const entry = await addRecipeToMealPlanDb(
            userId,
            validated.recipeId,
            validated.mealDate,
            validated.mealType,
            validated.servings
        )

        return { success: true, data: entry }
    } catch (error) {
        console.error('addRecipeToMealPlan error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể thêm công thức vào kế hoạch',
        }
    }
}

/**
 * T161: Add a quick note to meal plan
 */
export async function addQuickNoteToMealPlan(
    quickNote: string,
    mealDate: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<ActionResult<MealPlanEntryData>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập để lập kế hoạch bữa ăn' }
        }

        const validated = addQuickNoteSchema.parse({ quickNote, mealDate, mealType })

        const entry = await addQuickNoteToMealPlanDb(
            userId,
            validated.quickNote,
            validated.mealDate,
            validated.mealType
        )

        return { success: true, data: entry }
    } catch (error) {
        console.error('addQuickNoteToMealPlan error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể thêm ghi chú vào kế hoạch',
        }
    }
}

/**
 * T162: Remove a meal plan entry
 */
export async function removeMealPlanEntry(
    entryId: string
): Promise<ActionResult<{ removed: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = removeMealPlanEntrySchema.parse({ entryId })
        await removeMealPlanEntryDb(userId, validated.entryId)
        return { success: true, data: { removed: true } }
    } catch (error) {
        console.error('removeMealPlanEntry error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể xóa mục kế hoạch',
        }
    }
}

/**
 * T163: Update meal plan entry servings
 */
export async function updateMealPlanServings(
    entryId: string,
    servings: number
): Promise<ActionResult<{ updated: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = updateMealPlanServingsSchema.parse({ entryId, servings })
        await updateMealPlanServingsDb(userId, validated.entryId, validated.servings)
        return { success: true, data: { updated: true } }
    } catch (error) {
        console.error('updateMealPlanServings error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể cập nhật số phần ăn',
        }
    }
}

/**
 * T164: Mark meal as completed
 */
export async function markMealAsCompleted(
    entryId: string,
    isCompleted: boolean
): Promise<ActionResult<{ updated: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = markMealCompletedSchema.parse({ entryId, isCompleted })
        await markMealCompletedDb(userId, validated.entryId, validated.isCompleted)
        return { success: true, data: { updated: true } }
    } catch (error) {
        console.error('markMealAsCompleted error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái',
        }
    }
}

/**
 * T165: Get next upcoming meal
 */
export async function getNextUpcomingMeal(): Promise<ActionResult<MealPlanEntryData | null>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: true, data: null }
        }

        const meal = await queryNextMeal(userId)
        return { success: true, data: meal }
    } catch (error) {
        console.error('getNextUpcomingMeal error:', error)
        return { success: true, data: null }
    }
}

/**
 * Get daily summaries for a date range
 */
export async function getDailySummaries(
    startDate: string,
    endDate: string
): Promise<ActionResult<DailySummary[]>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const summaries = await queryDailySummaries(userId, startDate, endDate)
        return { success: true, data: summaries }
    } catch (error) {
        console.error('getDailySummaries error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải thống kê dinh dưỡng',
        }
    }
}
