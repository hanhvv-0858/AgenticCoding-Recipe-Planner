/**
 * Grocery List Validation Schemas (T193)
 * Schemas for grocery list operations
 */

import { z } from 'zod'

/**
 * Ingredient categories for grouping
 */
export const INGREDIENT_CATEGORIES = [
    'vegetables',
    'fruits',
    'meat',
    'seafood',
    'dairy',
    'grains',
    'seasonings',
    'condiments',
    'baking',
    'other',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
    vegetables: 'Rau củ',
    fruits: 'Trái cây',
    meat: 'Thịt',
    seafood: 'Hải sản',
    dairy: 'Sữa & trứng',
    grains: 'Ngũ cốc & tinh bột',
    seasonings: 'Gia vị',
    condiments: 'Nước chấm & sốt',
    baking: 'Nguyên liệu làm bánh',
    other: 'Khác',
}

export const CATEGORY_ICONS: Record<IngredientCategory, string> = {
    vegetables: '🥦',
    fruits: '🍎',
    meat: '🥩',
    seafood: '🦐',
    dairy: '🥛',
    grains: '🌾',
    seasonings: '🧂',
    condiments: '🫙',
    baking: '🧁',
    other: '📦',
}

export const CATEGORY_ORDER: Record<IngredientCategory, number> = {
    vegetables: 1,
    fruits: 2,
    meat: 3,
    seafood: 4,
    dairy: 5,
    grains: 6,
    seasonings: 7,
    condiments: 8,
    baking: 9,
    other: 10,
}

/**
 * Schema for generating grocery list from meal plan
 */
export const generateGroceryListSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày bắt đầu không hợp lệ'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày kết thúc không hợp lệ'),
})

/**
 * Schema for toggling grocery item checked status
 */
export const toggleGroceryItemSchema = z.object({
    itemId: z.string().uuid('ID nguyên liệu không hợp lệ'),
    isChecked: z.boolean(),
})

/**
 * Schema for adding a custom grocery item
 */
export const addCustomGroceryItemSchema = z.object({
    customName: z.string().min(1, 'Tên nguyên liệu không được trống').max(100, 'Tên tối đa 100 ký tự'),
    quantity: z.number().positive('Số lượng phải lớn hơn 0'),
    unit: z.string().min(1, 'Đơn vị không được trống').max(20, 'Đơn vị tối đa 20 ký tự'),
    category: z.enum(INGREDIENT_CATEGORIES).default('other'),
    notes: z.string().max(200, 'Ghi chú tối đa 200 ký tự').optional(),
})

/**
 * Schema for updating a grocery item
 */
export const updateGroceryItemSchema = z.object({
    itemId: z.string().uuid('ID nguyên liệu không hợp lệ'),
    quantity: z.number().positive('Số lượng phải lớn hơn 0').optional(),
    unit: z.string().min(1).max(20).optional(),
    notes: z.string().max(200).optional(),
})

/**
 * Schema for deleting a grocery item
 */
export const deleteGroceryItemSchema = z.object({
    itemId: z.string().uuid('ID nguyên liệu không hợp lệ'),
})

/**
 * Grocery list item data type
 */
export type GroceryListItemData = {
    id: string
    ingredient_id: string | null
    custom_name: string | null
    item_name: string
    quantity: number
    unit: string
    category: IngredientCategory
    is_checked: boolean
    source_meal_plan_ids: string[]
    notes: string | null
    icon_emoji: string | null
    created_at: string
}

/**
 * Grouped grocery list by category
 */
export type GroceryListGrouped = {
    category: IngredientCategory
    label: string
    icon: string
    items: GroceryListItemData[]
}

/**
 * Grocery list result with counts
 */
export type GroceryListResult = {
    groups: GroceryListGrouped[]
    totalItems: number
    checkedItems: number
    uncheckedItems: number
}

/**
 * Share format for grocery list
 */
export type GroceryShareText = string
