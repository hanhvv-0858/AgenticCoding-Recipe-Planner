/**
 * Common Validation Schemas with Zod
 * Base schemas used across the application
 */

import { z } from 'zod'

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('ID không hợp lệ')

/**
 * Date validation
 */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày không hợp lệ (YYYY-MM-DD)')

/**
 * Meal type enum
 */
export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'Loại bữa ăn không hợp lệ' }),
})

/**
 * Unit system enum
 */
export const unitSystemSchema = z.enum(['metric', 'imperial'], {
    errorMap: () => ({ message: 'Hệ đo lường không hợp lệ' }),
})

/**
 * Difficulty level enum
 */
export const difficultyLevelSchema = z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Độ khó không hợp lệ' }),
})

/**
 * Ingredient category enum
 */
export const ingredientCategorySchema = z.enum([
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
], {
    errorMap: () => ({ message: 'Loại nguyên liệu không hợp lệ' }),
})

/**
 * Positive number validation
 */
export const positiveNumberSchema = z.number().positive('Số phải lớn hơn 0')

/**
 * Non-negative number validation
 */
export const nonNegativeNumberSchema = z.number().nonnegative('Số không được âm')

/**
 * Rating validation (0-5)
 */
export const ratingSchema = z.number().min(0).max(5, 'Đánh giá phải từ 0 đến 5')

/**
 * Servings validation
 */
export const servingsSchema = z.number().int().positive('Số phần ăn phải lớn hơn 0').max(100, 'Số phần ăn tối đa là 100')

/**
 * Cooking time validation (in minutes)
 */
export const cookingTimeSchema = z.number().int().positive('Thời gian nấu phải lớn hơn 0').max(1440, 'Thời gian nấu tối đa là 24 giờ')

/**
 * Email validation
 */
export const emailSchema = z.string().email('Email không hợp lệ')

/**
 * Password validation
 */
export const passwordSchema = z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')

/**
 * Display name validation
 */
export const displayNameSchema = z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(50, 'Tên hiển thị tối đa 50 ký tự')
    .optional()

/**
 * Recipe name validation
 */
export const recipeNameSchema = z
    .string()
    .min(3, 'Tên món ăn phải có ít nhất 3 ký tự')
    .max(100, 'Tên món ăn tối đa 100 ký tự')

/**
 * Description validation
 */
export const descriptionSchema = z
    .string()
    .max(500, 'Mô tả tối đa 500 ký tự')
    .optional()

/**
 * URL validation
 */
export const urlSchema = z.string().url('URL không hợp lệ').optional()

/**
 * Instruction validation (for recipe steps)
 */
export const instructionSchema = z
    .string()
    .min(10, 'Hướng dẫn phải có ít nhất 10 ký tự')
    .max(1000, 'Hướng dẫn tối đa 1000 ký tự')

/**
 * Quantity validation
 */
export const quantitySchema = z
    .number()
    .positive('Số lượng phải lớn hơn 0')
    .max(10000, 'Số lượng tối đa là 10000')

/**
 * Unit validation
 */
export const unitSchema = z
    .string()
    .min(1, 'Đơn vị không được để trống')
    .max(20, 'Đơn vị tối đa 20 ký tự')

/**
 * Notes validation
 */
export const notesSchema = z
    .string()
    .max(500, 'Ghi chú tối đa 500 ký tự')
    .optional()

/**
 * Search query validation
 */
export const searchQuerySchema = z
    .string()
    .min(1, 'Từ khóa tìm kiếm không được để trống')
    .max(100, 'Từ khóa tìm kiếm tối đa 100 ký tự')

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
})

/**
 * Filter validation helpers
 */
export const filterSchema = {
    maxTime: z.number().int().positive().max(1440).optional(),
    maxCalories: z.number().int().positive().max(5000).optional(),
    tags: z.array(uuidSchema).optional(),
    difficulty: difficultyLevelSchema.optional(),
}
