/**
 * Recipe Search Integration Tests
 * Tests validation schemas, search params, and filter logic
 */

import {
    recipeSearchSchema,
    trendingRecipesSchema,
    tagFilterSchema,
} from '@/lib/validations/recipe'

describe('Recipe Validation Schemas', () => {
    describe('recipeSearchSchema', () => {
        it('should accept empty search params (defaults)', () => {
            const result = recipeSearchSchema.safeParse({})
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.page).toBe(1)
                expect(result.data.pageSize).toBe(12)
                expect(result.data.sortBy).toBe('rating')
                expect(result.data.sortOrder).toBe('desc')
            }
        })

        it('should accept valid search with query', () => {
            const result = recipeSearchSchema.safeParse({
                query: 'Phở Bò',
                page: 1,
                pageSize: 10,
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.query).toBe('Phở Bò')
            }
        })

        it('should accept all filter params', () => {
            const result = recipeSearchSchema.safeParse({
                query: 'chicken',
                tagSlug: 'quick-30min',
                maxCookingTime: 30,
                maxCalories: 500,
                minRating: 4,
                difficulty: 'easy',
                page: 2,
                pageSize: 20,
                sortBy: 'cooking_time',
                sortOrder: 'asc',
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.maxCookingTime).toBe(30)
                expect(result.data.maxCalories).toBe(500)
                expect(result.data.minRating).toBe(4)
                expect(result.data.difficulty).toBe('easy')
            }
        })

        it('should reject query longer than 200 characters', () => {
            const result = recipeSearchSchema.safeParse({
                query: 'a'.repeat(201),
            })
            expect(result.success).toBe(false)
        })

        it('should reject invalid difficulty level', () => {
            const result = recipeSearchSchema.safeParse({
                difficulty: 'invalid',
            })
            expect(result.success).toBe(false)
        })

        it('should reject negative page number', () => {
            const result = recipeSearchSchema.safeParse({
                page: -1,
            })
            expect(result.success).toBe(false)
        })

        it('should reject pageSize over 50', () => {
            const result = recipeSearchSchema.safeParse({
                pageSize: 51,
            })
            expect(result.success).toBe(false)
        })

        it('should reject maxCookingTime over 480', () => {
            const result = recipeSearchSchema.safeParse({
                maxCookingTime: 500,
            })
            expect(result.success).toBe(false)
        })

        it('should reject maxCalories over 5000', () => {
            const result = recipeSearchSchema.safeParse({
                maxCalories: 5001,
            })
            expect(result.success).toBe(false)
        })

        it('should reject minRating over 5', () => {
            const result = recipeSearchSchema.safeParse({
                minRating: 6,
            })
            expect(result.success).toBe(false)
        })

        it('should trim whitespace from query', () => {
            const result = recipeSearchSchema.safeParse({
                query: '  phở bò  ',
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.query).toBe('phở bò')
            }
        })

        it('should accept valid sortBy values', () => {
            const validSorts = ['rating', 'cooking_time', 'calories', 'created_at']
            for (const sort of validSorts) {
                const result = recipeSearchSchema.safeParse({ sortBy: sort })
                expect(result.success).toBe(true)
            }
        })

        it('should reject invalid sortBy value', () => {
            const result = recipeSearchSchema.safeParse({ sortBy: 'invalid' })
            expect(result.success).toBe(false)
        })
    })

    describe('trendingRecipesSchema', () => {
        it('should accept default limit', () => {
            const result = trendingRecipesSchema.safeParse({})
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.limit).toBe(6)
            }
        })

        it('should accept custom limit', () => {
            const result = trendingRecipesSchema.safeParse({ limit: 10 })
            expect(result.success).toBe(true)
        })

        it('should reject limit over 20', () => {
            const result = trendingRecipesSchema.safeParse({ limit: 21 })
            expect(result.success).toBe(false)
        })

        it('should reject zero limit', () => {
            const result = trendingRecipesSchema.safeParse({ limit: 0 })
            expect(result.success).toBe(false)
        })
    })

    describe('tagFilterSchema', () => {
        it('should accept valid tag slug', () => {
            const result = tagFilterSchema.safeParse({
                tagSlug: 'quick-30min',
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.page).toBe(1)
                expect(result.data.pageSize).toBe(12)
            }
        })

        it('should reject empty tag slug', () => {
            const result = tagFilterSchema.safeParse({
                tagSlug: '',
            })
            expect(result.success).toBe(false)
        })

        it('should reject whitespace-only tag slug', () => {
            const result = tagFilterSchema.safeParse({
                tagSlug: '   ',
            })
            expect(result.success).toBe(false)
        })

        it('should accept custom pagination', () => {
            const result = tagFilterSchema.safeParse({
                tagSlug: 'vietnamese',
                page: 3,
                pageSize: 24,
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.page).toBe(3)
                expect(result.data.pageSize).toBe(24)
            }
        })
    })
})

describe('Recipe Search Filter Logic', () => {
    it('should identify when filters are active', () => {
        const filters = {
            maxCookingTime: 30,
            maxCalories: undefined,
            minRating: undefined,
            difficulty: undefined,
        }
        const hasActiveFilters = Object.values(filters).some(v => v !== undefined)
        expect(hasActiveFilters).toBe(true)
    })

    it('should identify when no filters are active', () => {
        const filters = {
            maxCookingTime: undefined,
            maxCalories: undefined,
            minRating: undefined,
            difficulty: undefined,
        }
        const hasActiveFilters = Object.values(filters).some(v => v !== undefined)
        expect(hasActiveFilters).toBe(false)
    })

    it('should calculate pagination correctly', () => {
        const page = 3
        const pageSize = 12
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        expect(from).toBe(24)
        expect(to).toBe(35)
    })

    it('should calculate total pages correctly', () => {
        expect(Math.ceil(50 / 12)).toBe(5)
        expect(Math.ceil(12 / 12)).toBe(1)
        expect(Math.ceil(0 / 12)).toBe(0)
        expect(Math.ceil(13 / 12)).toBe(2)
    })
})

/**
 * Phase 6 Integration Tests: Recipe Detail & Scaling (T129-T131)
 */
describe('Recipe Scaling Logic', () => {
    const { scaleIngredientQuantity, scaleRecipeIngredients, formatQuantity } = require('@/lib/utils/recipe-scaling')

    describe('scaleIngredientQuantity', () => {
        it('should scale linearly when doubling servings', () => {
            expect(scaleIngredientQuantity(100, 2, 4)).toBe(200)
        })

        it('should scale linearly when halving servings', () => {
            expect(scaleIngredientQuantity(100, 4, 2)).toBe(50)
        })

        it('should return original quantity when servings unchanged', () => {
            expect(scaleIngredientQuantity(250, 4, 4)).toBe(250)
        })

        it('should handle 1 serving to 10 servings (10x)', () => {
            expect(scaleIngredientQuantity(50, 1, 10)).toBe(500)
        })

        it('should handle fractional scaling (0.5x)', () => {
            const result = scaleIngredientQuantity(100, 4, 2)
            expect(result).toBe(50)
        })

        it('should handle edge case with 0 original servings', () => {
            expect(scaleIngredientQuantity(100, 0, 4)).toBe(100)
        })

        it('should handle edge case with 0 target servings', () => {
            expect(scaleIngredientQuantity(100, 4, 0)).toBe(100)
        })

        it('should round small quantities to 2 decimal places', () => {
            const result = scaleIngredientQuantity(1, 3, 1)
            expect(result).toBe(0.33)
        })

        it('should round medium quantities to 1 decimal place', () => {
            const result = scaleIngredientQuantity(15, 4, 3)
            expect(result).toBe(11.3)
        })

        it('should round large quantities to integers', () => {
            const result = scaleIngredientQuantity(200, 2, 3)
            expect(result).toBe(300)
        })
    })

    describe('scaleRecipeIngredients', () => {
        const mockIngredients = [
            { id: '1', ingredient_id: 'a', ingredient_name: 'Salt', quantity: 5, unit: 'g', preparation_note: null, is_optional: false, display_order: 1, icon_emoji: null, category: 'seasonings' },
            { id: '2', ingredient_id: 'b', ingredient_name: 'Chicken', quantity: 500, unit: 'g', preparation_note: 'sliced', is_optional: false, display_order: 2, icon_emoji: '🍗', category: 'meat' },
        ]

        it('should add scaled_quantity to each ingredient', () => {
            const result = scaleRecipeIngredients(mockIngredients, 2, 4)
            expect(result[0].scaled_quantity).toBe(10)
            expect(result[1].scaled_quantity).toBe(1000)
        })

        it('should preserve original properties', () => {
            const result = scaleRecipeIngredients(mockIngredients, 2, 4)
            expect(result[0].ingredient_name).toBe('Salt')
            expect(result[0].unit).toBe('g')
            expect(result[1].icon_emoji).toBe('🍗')
        })
    })

    describe('formatQuantity', () => {
        it('should format whole numbers without decimals', () => {
            expect(formatQuantity(5)).toBe('5')
        })

        it('should format 0.5 as ½', () => {
            expect(formatQuantity(0.5)).toBe('½')
        })

        it('should format 0.25 as ¼', () => {
            expect(formatQuantity(0.25)).toBe('¼')
        })

        it('should format 1.5 as 1 ½', () => {
            expect(formatQuantity(1.5)).toBe('1 ½')
        })

        it('should format 2.75 as 2 ¾', () => {
            expect(formatQuantity(2.75)).toBe('2 ¾')
        })

        it('should format non-fraction decimals with precision', () => {
            const result = formatQuantity(3.14)
            expect(result).toBe('3.14')
        })
    })
})
