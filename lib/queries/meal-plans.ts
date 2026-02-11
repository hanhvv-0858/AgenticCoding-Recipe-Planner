/**
 * Meal Plan Database Queries (T156, T157, T158)
 * Queries for meal plan CRUD operations
 */

import { createClient } from '@/lib/supabase/server'
import type { MealPlanEntryData, DailySummary, MealType } from '@/lib/validations/meal-plan'

type MealPlanRow = {
    id: string
    user_id: string
    recipe_id: string | null
    quick_note: string | null
    meal_date: string
    meal_type: MealType
    servings: number
    is_completed: boolean
    created_at: string
    updated_at: string
    recipes: {
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
 * T156: Get meal plan entries for a date range
 */
export async function getMealPlan(
    userId: string,
    startDate: string,
    endDate: string
): Promise<MealPlanEntryData[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('meal_plan_entries')
        .select(`
            id,
            user_id,
            recipe_id,
            quick_note,
            meal_date,
            meal_type,
            servings,
            is_completed,
            created_at,
            updated_at,
            recipes (
                id,
                name,
                cover_image_url,
                cooking_time_minutes,
                calories_per_serving,
                protein_grams,
                carbs_grams,
                fat_grams,
                servings
            )
        `)
        .eq('user_id', userId)
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)
        .order('meal_date', { ascending: true })
        .order('created_at', { ascending: true }) as unknown as {
            data: MealPlanRow[] | null
            error: { message: string } | null
        }

    if (error) {
        console.error('getMealPlan error:', error)
        throw new Error('Không thể tải kế hoạch bữa ăn')
    }

    return (data ?? []).map(row => ({
        id: row.id,
        user_id: row.user_id,
        recipe_id: row.recipe_id,
        quick_note: row.quick_note,
        meal_date: row.meal_date,
        meal_type: row.meal_type,
        servings: row.servings,
        is_completed: row.is_completed,
        created_at: row.created_at,
        recipe: row.recipes,
    }))
}

/**
 * T157: Get daily nutritional summaries for meal plan
 */
export async function getDailySummaries(
    userId: string,
    startDate: string,
    endDate: string
): Promise<DailySummary[]> {
    const entries = await getMealPlan(userId, startDate, endDate)

    // Group by date and calculate totals
    const dateMap = new Map<string, DailySummary>()

    for (const entry of entries) {
        if (!dateMap.has(entry.meal_date)) {
            dateMap.set(entry.meal_date, {
                date: entry.meal_date,
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                mealCount: 0,
            })
        }

        const summary = dateMap.get(entry.meal_date)!
        summary.mealCount++

        if (entry.recipe) {
            const ratio = entry.servings / (entry.recipe.servings || 1)
            summary.totalCalories += Math.round((entry.recipe.calories_per_serving ?? 0) * ratio)
            summary.totalProtein += Math.round((entry.recipe.protein_grams ?? 0) * ratio)
            summary.totalCarbs += Math.round((entry.recipe.carbs_grams ?? 0) * ratio)
            summary.totalFat += Math.round((entry.recipe.fat_grams ?? 0) * ratio)
        }
    }

    return Array.from(dateMap.values())
}

/**
 * T158: Get the next upcoming meal for the user
 */
export async function getNextUpcomingMeal(
    userId: string
): Promise<MealPlanEntryData | null> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const mealTypeOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
    const currentHour = new Date().getHours()

    // Determine current meal type based on time
    let currentMealIndex = 0
    if (currentHour >= 14) currentMealIndex = 2 // dinner
    else if (currentHour >= 11) currentMealIndex = 1 // lunch
    else currentMealIndex = 0 // breakfast

    const { data, error } = await supabase
        .from('meal_plan_entries')
        .select(`
            id,
            user_id,
            recipe_id,
            quick_note,
            meal_date,
            meal_type,
            servings,
            is_completed,
            created_at,
            updated_at,
            recipes (
                id,
                name,
                cover_image_url,
                cooking_time_minutes,
                calories_per_serving,
                protein_grams,
                carbs_grams,
                fat_grams,
                servings
            )
        `)
        .eq('user_id', userId)
        .eq('is_completed', false)
        .gte('meal_date', today)
        .order('meal_date', { ascending: true })
        .limit(10) as unknown as {
            data: MealPlanRow[] | null
            error: { message: string } | null
        }

    if (error || !data || data.length === 0) {
        return null
    }

    // Find the next meal by date and meal type order
    const todayEntries = data.filter(e => e.meal_date === today)
    const futureEntries = data.filter(e => e.meal_date > today)

    // Check today's remaining meals
    for (let i = currentMealIndex; i < mealTypeOrder.length; i++) {
        const match = todayEntries.find(e => e.meal_type === mealTypeOrder[i])
        if (match) {
            return {
                id: match.id,
                user_id: match.user_id,
                recipe_id: match.recipe_id,
                quick_note: match.quick_note,
                meal_date: match.meal_date,
                meal_type: match.meal_type,
                servings: match.servings,
                is_completed: match.is_completed,
                created_at: match.created_at,
                recipe: match.recipes,
            }
        }
    }

    // Return first future entry
    if (futureEntries.length > 0) {
        const first = futureEntries[0]
        return {
            id: first.id,
            user_id: first.user_id,
            recipe_id: first.recipe_id,
            quick_note: first.quick_note,
            meal_date: first.meal_date,
            meal_type: first.meal_type,
            servings: first.servings,
            is_completed: first.is_completed,
            created_at: first.created_at,
            recipe: first.recipes,
        }
    }

    return null
}

/**
 * Add a recipe to meal plan
 */
export async function addRecipeToMealPlanDb(
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: MealType,
    servings: number
): Promise<MealPlanEntryData> {
    const supabase = await createClient()

    const { data, error } = await (supabase
        .from('meal_plan_entries') as unknown as { insert: (row: Record<string, unknown>) => { select: (q: string) => { single: () => Promise<{ data: MealPlanRow | null, error: { message: string } | null }> } } })
        .insert({
            user_id: userId,
            recipe_id: recipeId,
            meal_date: mealDate,
            meal_type: mealType,
            servings,
        })
        .select(`
            id,
            user_id,
            recipe_id,
            quick_note,
            meal_date,
            meal_type,
            servings,
            is_completed,
            created_at,
            updated_at,
            recipes (
                id,
                name,
                cover_image_url,
                cooking_time_minutes,
                calories_per_serving,
                protein_grams,
                carbs_grams,
                fat_grams,
                servings
            )
        `)
        .single()

    if (error || !data) {
        console.error('addRecipeToMealPlanDb error:', error)
        throw new Error('Không thể thêm công thức vào kế hoạch')
    }

    return {
        id: data.id,
        user_id: data.user_id,
        recipe_id: data.recipe_id,
        quick_note: data.quick_note,
        meal_date: data.meal_date,
        meal_type: data.meal_type,
        servings: data.servings,
        is_completed: data.is_completed,
        created_at: data.created_at,
        recipe: data.recipes,
    }
}

/**
 * Add a quick note to meal plan
 */
export async function addQuickNoteToMealPlanDb(
    userId: string,
    quickNote: string,
    mealDate: string,
    mealType: MealType
): Promise<MealPlanEntryData> {
    const supabase = await createClient()

    const { data, error } = await (supabase
        .from('meal_plan_entries') as unknown as { insert: (row: Record<string, unknown>) => { select: (q: string) => { single: () => Promise<{ data: MealPlanRow | null, error: { message: string } | null }> } } })
        .insert({
            user_id: userId,
            quick_note: quickNote,
            meal_date: mealDate,
            meal_type: mealType,
            servings: 1,
        })
        .select(`
            id,
            user_id,
            recipe_id,
            quick_note,
            meal_date,
            meal_type,
            servings,
            is_completed,
            created_at,
            updated_at,
            recipes (
                id,
                name,
                cover_image_url,
                cooking_time_minutes,
                calories_per_serving,
                protein_grams,
                carbs_grams,
                fat_grams,
                servings
            )
        `)
        .single()

    if (error || !data) {
        console.error('addQuickNoteToMealPlanDb error:', error)
        throw new Error('Không thể thêm ghi chú vào kế hoạch')
    }

    return {
        id: data.id,
        user_id: data.user_id,
        recipe_id: data.recipe_id,
        quick_note: data.quick_note,
        meal_date: data.meal_date,
        meal_type: data.meal_type,
        servings: data.servings,
        is_completed: data.is_completed,
        created_at: data.created_at,
        recipe: data.recipes,
    }
}

/**
 * Remove a meal plan entry
 */
export async function removeMealPlanEntryDb(
    userId: string,
    entryId: string
): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('meal_plan_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId)

    if (error) {
        console.error('removeMealPlanEntryDb error:', error)
        throw new Error('Không thể xóa mục kế hoạch')
    }
}

/**
 * Update meal plan entry servings
 */
export async function updateMealPlanServingsDb(
    userId: string,
    entryId: string,
    servings: number
): Promise<void> {
    const supabase = await createClient()

    const { error } = await (supabase
        .from('meal_plan_entries') as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => Promise<{ error: { message: string } | null }> } } })
        .update({ servings, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId)

    if (error) {
        console.error('updateMealPlanServingsDb error:', error)
        throw new Error('Không thể cập nhật số phần ăn')
    }
}

/**
 * Mark meal as completed/uncompleted
 */
export async function markMealCompletedDb(
    userId: string,
    entryId: string,
    isCompleted: boolean
): Promise<void> {
    const supabase = await createClient()

    const { error } = await (supabase
        .from('meal_plan_entries') as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => Promise<{ error: { message: string } | null }> } } })
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', userId)

    if (error) {
        console.error('markMealCompletedDb error:', error)
        throw new Error('Không thể cập nhật trạng thái bữa ăn')
    }
}
