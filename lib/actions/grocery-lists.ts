'use server'

/**
 * Grocery List Server Actions (T196-T203)
 *
 * Server-side actions for grocery list CRUD operations.
 * Each action follows the pattern:
 *   1. Authenticate the user via Supabase session
 *   2. Validate input with Zod schemas
 *   3. Delegate to a query/mutation helper
 *   4. Return a discriminated `ActionResult<T>` union
 *
 * Error messages are in Vietnamese to match the app’s locale.
 */

import {
    generateGroceryListSchema,
    toggleGroceryItemSchema,
    addCustomGroceryItemSchema,
    updateGroceryItemSchema,
    deleteGroceryItemSchema,
    type GroceryListResult,
} from '@/lib/validations/grocery-list'
import {
    getGroceryList as queryGroceryList,
    getUncheckedCount as queryUncheckedCount,
    generateGroceryListFromMealPlan,
    toggleGroceryItemCheckedDb,
    addCustomGroceryItemDb,
    updateGroceryItemDb,
    deleteGroceryItemDb,
    clearCompletedItemsDb,
} from '@/lib/queries/grocery-lists'
import { generateShareText } from '@/lib/utils/merge-ingredients'
import { createClient } from '@/lib/supabase/server'

/**
 * Discriminated union for action return values.
 * Every server action returns either `{ success: true, data: T }` or
 * `{ success: false, error: string }`, making error handling predictable
 * on the client side.
 */
type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Retrieve the authenticated user’s ID from the current Supabase session.
 *
 * @returns The user ID string, or `null` if the user is not authenticated
 */
async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
}

/**
 * Generate a grocery list from the user’s meal plan within a date range.
 *
 * This triggers the smart-merge algorithm:
 *  1. Fetches all meal plan entries between `startDate` and `endDate`.
 *  2. Extracts ingredients from every planned recipe.
 *  3. Merges identical ingredients (with unit conversion) via
 *     `generateGroceryListFromMealPlan`.
 *  4. Persists the merged list to the database.
 *  5. Returns the freshly generated grocery list.
 *
 * @param startDate - ISO date string for the range start (inclusive)
 * @param endDate   - ISO date string for the range end (inclusive)
 * @returns The generated grocery list grouped by category, or an error message
 */
export async function generateGroceryList(
    startDate: string,
    endDate: string
): Promise<ActionResult<GroceryListResult>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = generateGroceryListSchema.parse({ startDate, endDate })
        await generateGroceryListFromMealPlan(userId, validated.startDate, validated.endDate)

        const result = await queryGroceryList(userId)
        return { success: true, data: result }
    } catch (error) {
        console.error('generateGroceryList error:', error)
        return { success: false, error: 'Không thể tạo danh sách mua sắm' }
    }
}

/**
 * Fetch the current user’s grocery list.
 *
 * @returns The full grocery list (items grouped by category) or an error message
 */
export async function getGroceryList(): Promise<ActionResult<GroceryListResult>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const result = await queryGroceryList(userId)
        return { success: true, data: result }
    } catch (error) {
        console.error('getGroceryList error:', error)
        return { success: false, error: 'Không thể tải danh sách mua sắm' }
    }
}

/**
 * Toggle the checked/unchecked status of a grocery list item.
 *
 * Used when the user taps an item in the grocery list to mark it as
 * purchased or to undo that action.
 *
 * @param itemId    - UUID of the grocery list item
 * @param isChecked - New checked state (`true` = purchased)
 * @returns The new checked state, or an error message
 */
export async function toggleGroceryItemChecked(
    itemId: string,
    isChecked: boolean
): Promise<ActionResult<{ isChecked: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = toggleGroceryItemSchema.parse({ itemId, isChecked })
        await toggleGroceryItemCheckedDb(userId, validated.itemId, validated.isChecked)

        return { success: true, data: { isChecked: validated.isChecked } }
    } catch (error) {
        console.error('toggleGroceryItemChecked error:', error)
        return { success: false, error: 'Không thể cập nhật trạng thái' }
    }
}

/**
 * Add a custom (non-recipe) item to the grocery list.
 *
 * Allows users to manually add items that aren’t tied to any recipe,
 * such as household supplies.
 *
 * @param customName - Display name for the item
 * @param quantity   - Numeric amount
 * @param unit       - Unit string (e.g. "pieces", "kg")
 * @param category   - Optional category slug; defaults to 'other'
 * @param notes      - Optional free-text notes
 * @returns The newly created item’s ID, or an error message
 */
export async function addCustomGroceryItem(
    customName: string,
    quantity: number,
    unit: string,
    category?: string,
    notes?: string
): Promise<ActionResult<{ id: string }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = addCustomGroceryItemSchema.parse({
            customName,
            quantity,
            unit,
            category: category ?? 'other',
            notes,
        })

        const result = await addCustomGroceryItemDb(
            userId,
            validated.customName,
            validated.quantity,
            validated.unit,
            validated.category,
            validated.notes
        )

        return { success: true, data: result }
    } catch (error) {
        console.error('addCustomGroceryItem error:', error)
        return { success: false, error: 'Không thể thêm nguyên liệu' }
    }
}

/**
 * Update an existing grocery list item’s quantity, unit, or notes.
 *
 * @param itemId  - UUID of the grocery list item to update
 * @param updates - Partial object with fields to change
 * @returns Confirmation of update, or an error message
 */
export async function updateGroceryItem(
    itemId: string,
    updates: { quantity?: number; unit?: string; notes?: string }
): Promise<ActionResult<{ updated: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = updateGroceryItemSchema.parse({ itemId, ...updates })
        const { itemId: validatedId, ...restUpdates } = validated
        await updateGroceryItemDb(userId, validatedId, restUpdates)

        return { success: true, data: { updated: true } }
    } catch (error) {
        console.error('updateGroceryItem error:', error)
        return { success: false, error: 'Không thể cập nhật nguyên liệu' }
    }
}

/**
 * Delete a single grocery list item.
 *
 * @param itemId - UUID of the item to remove
 * @returns Confirmation of deletion, or an error message
 */
export async function deleteGroceryItem(
    itemId: string
): Promise<ActionResult<{ deleted: boolean }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const validated = deleteGroceryItemSchema.parse({ itemId })
        await deleteGroceryItemDb(userId, validated.itemId)

        return { success: true, data: { deleted: true } }
    } catch (error) {
        console.error('deleteGroceryItem error:', error)
        return { success: false, error: 'Không thể xoá nguyên liệu' }
    }
}

/**
 * Remove all items that have been marked as checked (purchased).
 *
 * Useful for clearing out bought items after a shopping trip.
 *
 * @returns The number of items removed, or an error message
 */
export async function clearCompletedGroceryItems(): Promise<ActionResult<{ clearedCount: number }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const count = await clearCompletedItemsDb(userId)
        return { success: true, data: { clearedCount: count } }
    } catch (error) {
        console.error('clearCompletedGroceryItems error:', error)
        return { success: false, error: 'Không thể xoá các mục đã mua' }
    }
}

/**
 * Generate a plain-text version of the grocery list for sharing.
 *
 * Delegates formatting to {@link generateShareText} which produces
 * a Unicode-friendly string with category headers and checkbox symbols.
 *
 * @returns The shareable text string, or an error message
 */
export async function generateShareableGroceryList(): Promise<ActionResult<{ text: string }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: false, error: 'Bạn cần đăng nhập' }
        }

        const result = await queryGroceryList(userId)
        const text = generateShareText(result.groups)

        return { success: true, data: { text } }
    } catch (error) {
        console.error('generateShareableGroceryList error:', error)
        return { success: false, error: 'Không thể tạo văn bản chia sẻ' }
    }
}

/**
 * Get the count of unchecked grocery items for the navigation badge.
 *
 * Returns 0 (not an error) when the user is unauthenticated or when
 * an error occurs, so the badge simply hides rather than showing an error.
 *
 * @returns The unchecked item count
 */
export async function getUncheckedGroceryCount(): Promise<ActionResult<{ count: number }>> {
    try {
        const userId = await getAuthUserId()
        if (!userId) {
            return { success: true, data: { count: 0 } }
        }

        const count = await queryUncheckedCount(userId)
        return { success: true, data: { count } }
    } catch (error) {
        console.error('getUncheckedGroceryCount error:', error)
        return { success: true, data: { count: 0 } }
    }
}
