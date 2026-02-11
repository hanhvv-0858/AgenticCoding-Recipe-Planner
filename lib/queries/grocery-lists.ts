/**
 * Grocery List Database Queries (T194-T195)
 * Queries for grocery list operations
 */

import { createClient } from '@/lib/supabase/server'
import type { GroceryListItemData, GroceryListGrouped, GroceryListResult, IngredientCategory } from '@/lib/validations/grocery-list'
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_ORDER } from '@/lib/validations/grocery-list'
import { mergeIngredients, type IngredientEntry } from '@/lib/utils/merge-ingredients'

type GroceryRow = {
    id: string
    user_id: string
    ingredient_id: string | null
    custom_name: string | null
    quantity: number
    unit: string
    category: string | null
    is_checked: boolean
    source_meal_plan_ids: string[]
    notes: string | null
    created_at: string
    ingredients: {
        name: string
        category: string
        icon_emoji: string | null
    } | null
}

/**
 * T194: Get grocery list grouped by category
 */
export async function getGroceryList(userId: string): Promise<GroceryListResult> {
    const supabase = await createClient()

    const { data, error } = await (supabase
        .from('grocery_list_items')
        .select(`
            id,
            user_id,
            ingredient_id,
            custom_name,
            quantity,
            unit,
            category,
            is_checked,
            source_meal_plan_ids,
            notes,
            created_at,
            ingredients (
                name,
                category,
                icon_emoji
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true }) as unknown as Promise<{ data: GroceryRow[] | null; error: { message: string } | null }>)

    if (error) {
        console.error('getGroceryList error:', error)
        return { groups: [], totalItems: 0, checkedItems: 0, uncheckedItems: 0 }
    }

    const items: GroceryListItemData[] = (data ?? []).map(row => ({
        id: row.id,
        ingredient_id: row.ingredient_id,
        custom_name: row.custom_name,
        item_name: row.ingredients?.name ?? row.custom_name ?? 'Không tên',
        quantity: Number(row.quantity),
        unit: row.unit,
        category: (row.ingredients?.category ?? row.category ?? 'other') as IngredientCategory,
        is_checked: row.is_checked,
        source_meal_plan_ids: row.source_meal_plan_ids ?? [],
        notes: row.notes,
        icon_emoji: row.ingredients?.icon_emoji ?? null,
        created_at: row.created_at,
    }))

    // Group by category
    const categoryMap = new Map<IngredientCategory, GroceryListItemData[]>()
    for (const item of items) {
        if (!categoryMap.has(item.category)) {
            categoryMap.set(item.category, [])
        }
        categoryMap.get(item.category)!.push(item)
    }

    // Build sorted groups
    const groups: GroceryListGrouped[] = Array.from(categoryMap.entries())
        .map(([category, categoryItems]) => ({
            category,
            label: CATEGORY_LABELS[category] ?? category,
            icon: CATEGORY_ICONS[category] ?? '📦',
            items: categoryItems,
        }))
        .sort((a, b) => (CATEGORY_ORDER[a.category] ?? 10) - (CATEGORY_ORDER[b.category] ?? 10))

    const totalItems = items.length
    const checkedItems = items.filter(i => i.is_checked).length

    return {
        groups,
        totalItems,
        checkedItems,
        uncheckedItems: totalItems - checkedItems,
    }
}

/**
 * T195: Get unchecked item count for badge
 */
export async function getUncheckedCount(userId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('grocery_list_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_checked', false)

    if (error) {
        console.error('getUncheckedCount error:', error)
        return 0
    }

    return count ?? 0
}

/**
 * Generate grocery list items from meal plan entries
 * Fetches meal plan entries with recipes and ingredients, merges, and inserts
 */
export async function generateGroceryListFromMealPlan(
    userId: string,
    startDate: string,
    endDate: string
): Promise<void> {
    const supabase = await createClient()

    // 1. Delete existing generated items (those with source_meal_plan_ids)
    await (supabase
        .from('grocery_list_items')
        .delete()
        .eq('user_id', userId)
        .not('source_meal_plan_ids', 'eq', '{}') as unknown as Promise<{ error: { message: string } | null }>)

    // 2. Fetch meal plan entries with recipes for the date range
    const { data: mealEntries, error: mealError } = await (supabase
        .from('meal_plan_entries')
        .select(`
            id,
            recipe_id,
            servings,
            recipes (
                id,
                name,
                servings,
                recipe_ingredients (
                    ingredient_id,
                    quantity,
                    unit,
                    ingredients (
                        id,
                        name,
                        category,
                        icon_emoji
                    )
                )
            )
        `)
        .eq('user_id', userId)
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)
        .not('recipe_id', 'is', null) as unknown as Promise<{
            data: Array<{
                id: string
                recipe_id: string
                servings: number
                recipes: {
                    id: string
                    name: string
                    servings: number
                    recipe_ingredients: Array<{
                        ingredient_id: string
                        quantity: number
                        unit: string
                        ingredients: {
                            id: string
                            name: string
                            category: string
                            icon_emoji: string | null
                        }
                    }>
                }
            }> | null
            error: { message: string } | null
        }>)

    if (mealError) {
        console.error('generateGroceryList meal fetch error:', mealError)
        throw new Error('Không thể tạo danh sách mua sắm')
    }

    if (!mealEntries || mealEntries.length === 0) return

    // 3. Build ingredient entries with scaling
    const ingredientEntries: IngredientEntry[] = []

    for (const entry of mealEntries) {
        const recipe = entry.recipes
        if (!recipe?.recipe_ingredients) continue

        const servingRatio = entry.servings / (recipe.servings || 1)

        for (const ri of recipe.recipe_ingredients) {
            ingredientEntries.push({
                ingredientId: ri.ingredient_id,
                ingredientName: ri.ingredients.name,
                quantity: Number(ri.quantity) * servingRatio,
                unit: ri.unit,
                category: ri.ingredients.category,
                recipeName: recipe.name,
                mealPlanEntryId: entry.id,
                iconEmoji: ri.ingredients.icon_emoji,
            })
        }
    }

    if (ingredientEntries.length === 0) return

    // 4. Merge ingredients
    const merged = mergeIngredients(ingredientEntries)

    // 5. Insert merged items
    const insertRows = merged.map(item => ({
        user_id: userId,
        ingredient_id: item.ingredientId,
        custom_name: item.ingredientId ? null : item.ingredientName,
        quantity: item.totalQuantity,
        unit: item.displayUnit,
        category: item.category,
        is_checked: false,
        source_meal_plan_ids: item.sourceMealPlanIds,
        notes: item.sourceRecipes.length > 0
            ? `Cho món: ${item.sourceRecipes.join(', ')}`
            : null,
    }))

    const { error: insertError } = await (supabase
        .from('grocery_list_items') as unknown as { insert: (rows: typeof insertRows) => Promise<{ error: { message: string } | null }> })
        .insert(insertRows)

    if (insertError) {
        console.error('generateGroceryList insert error:', insertError)
        throw new Error('Không thể lưu danh sách mua sắm')
    }
}

/**
 * Toggle grocery item checked status
 */
export async function toggleGroceryItemCheckedDb(
    userId: string,
    itemId: string,
    isChecked: boolean
): Promise<void> {
    const supabase = await createClient()

    const { error } = await (supabase
        .from('grocery_list_items') as unknown as { update: (vals: { is_checked: boolean }) => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> } } })
        .update({ is_checked: isChecked })
        .eq('id', itemId)
        .eq('user_id', userId)

    if (error) {
        console.error('toggleGroceryItemChecked error:', error)
        throw new Error('Không thể cập nhật trạng thái')
    }
}

/**
 * Add custom grocery item
 */
export async function addCustomGroceryItemDb(
    userId: string,
    customName: string,
    quantity: number,
    unit: string,
    category: string,
    notes?: string
): Promise<{ id: string }> {
    const supabase = await createClient()

    const insertRow = {
        user_id: userId,
        custom_name: customName,
        quantity,
        unit,
        category,
        notes: notes ?? null,
        source_meal_plan_ids: [],
    }

    const { data, error } = await (supabase
        .from('grocery_list_items') as unknown as { insert: (row: typeof insertRow) => { select: (col: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> } } })
        .insert(insertRow)
        .select('id')
        .single()

    if (error || !data) {
        console.error('addCustomGroceryItem error:', error)
        throw new Error('Không thể thêm nguyên liệu')
    }

    return data
}

/**
 * Update grocery item
 */
export async function updateGroceryItemDb(
    userId: string,
    itemId: string,
    updates: { quantity?: number; unit?: string; notes?: string }
): Promise<void> {
    const supabase = await createClient()

    const { error } = await (supabase
        .from('grocery_list_items') as unknown as { update: (vals: typeof updates) => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> } } })
        .update(updates)
        .eq('id', itemId)
        .eq('user_id', userId)

    if (error) {
        console.error('updateGroceryItem error:', error)
        throw new Error('Không thể cập nhật nguyên liệu')
    }
}

/**
 * Delete grocery item
 */
export async function deleteGroceryItemDb(
    userId: string,
    itemId: string
): Promise<void> {
    const supabase = await createClient()

    const { error } = await (supabase
        .from('grocery_list_items') as unknown as { delete: () => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> } } })
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)

    if (error) {
        console.error('deleteGroceryItem error:', error)
        throw new Error('Không thể xoá nguyên liệu')
    }
}

/**
 * Clear all checked grocery items
 */
export async function clearCompletedItemsDb(userId: string): Promise<number> {
    const supabase = await createClient()

    // Get count first
    const { count } = await supabase
        .from('grocery_list_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_checked', true)

    const { error } = await (supabase
        .from('grocery_list_items') as unknown as { delete: () => { eq: (col: string, val: string) => { eq: (col: string, val: boolean) => Promise<{ error: { message: string } | null }> } } })
        .delete()
        .eq('user_id', userId)
        .eq('is_checked', true)

    if (error) {
        console.error('clearCompletedItems error:', error)
        throw new Error('Không thể xoá các mục đã mua')
    }

    return count ?? 0
}
