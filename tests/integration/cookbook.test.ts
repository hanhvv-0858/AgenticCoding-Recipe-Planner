/**
 * Phase 7 Integration Tests: Personal Cookbook (T148-T150)
 */

// Import schemas
const { saveRecipeSchema, unsaveRecipeSchema, savedRecipesQuerySchema } = require('@/lib/validations/cookbook')

describe('Cookbook Validation Schemas', () => {
    describe('saveRecipeSchema', () => {
        it('should accept valid recipe ID', () => {
            const result = saveRecipeSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
            })
            expect(result.recipeId).toBe('550e8400-e29b-41d4-a716-446655440000')
        })

        it('should accept recipe ID with notes', () => {
            const result = saveRecipeSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                notes: 'Món ngon cho cuối tuần',
            })
            expect(result.notes).toBe('Món ngon cho cuối tuần')
        })

        it('should reject invalid UUID', () => {
            expect(() => saveRecipeSchema.parse({
                recipeId: 'not-a-uuid',
            })).toThrow()
        })

        it('should reject notes longer than 500 chars', () => {
            expect(() => saveRecipeSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                notes: 'a'.repeat(501),
            })).toThrow()
        })

        it('should accept empty notes (optional)', () => {
            const result = saveRecipeSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
            })
            expect(result.notes).toBeUndefined()
        })
    })

    describe('unsaveRecipeSchema', () => {
        it('should accept valid recipe ID', () => {
            const result = unsaveRecipeSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
            })
            expect(result.recipeId).toBe('550e8400-e29b-41d4-a716-446655440000')
        })

        it('should reject invalid UUID', () => {
            expect(() => unsaveRecipeSchema.parse({
                recipeId: 'invalid',
            })).toThrow()
        })
    })

    describe('savedRecipesQuerySchema', () => {
        it('should use defaults when no params provided', () => {
            const result = savedRecipesQuerySchema.parse({})
            expect(result.page).toBe(1)
            expect(result.pageSize).toBe(12)
            expect(result.sortBy).toBe('saved_at')
            expect(result.sortOrder).toBe('desc')
        })

        it('should accept custom pagination', () => {
            const result = savedRecipesQuerySchema.parse({
                page: 3,
                pageSize: 24,
            })
            expect(result.page).toBe(3)
            expect(result.pageSize).toBe(24)
        })

        it('should accept valid sortBy values', () => {
            expect(savedRecipesQuerySchema.parse({ sortBy: 'saved_at' }).sortBy).toBe('saved_at')
            expect(savedRecipesQuerySchema.parse({ sortBy: 'name' }).sortBy).toBe('name')
            expect(savedRecipesQuerySchema.parse({ sortBy: 'rating' }).sortBy).toBe('rating')
        })

        it('should reject invalid sortBy value', () => {
            expect(() => savedRecipesQuerySchema.parse({ sortBy: 'invalid' })).toThrow()
        })

        it('should reject page less than 1', () => {
            expect(() => savedRecipesQuerySchema.parse({ page: 0 })).toThrow()
        })

        it('should reject pageSize over 50', () => {
            expect(() => savedRecipesQuerySchema.parse({ pageSize: 51 })).toThrow()
        })

        it('should accept asc and desc sort orders', () => {
            expect(savedRecipesQuerySchema.parse({ sortOrder: 'asc' }).sortOrder).toBe('asc')
            expect(savedRecipesQuerySchema.parse({ sortOrder: 'desc' }).sortOrder).toBe('desc')
        })
    })
})

describe('Cookbook Logic', () => {
    // T149: Test pagination calculation
    it('should calculate correct total pages for saved recipes', () => {
        expect(Math.ceil(10 / 12)).toBe(1)
        expect(Math.ceil(24 / 12)).toBe(2)
        expect(Math.ceil(0 / 12)).toBe(0)
        expect(Math.ceil(13 / 12)).toBe(2)
    })

    // T150: Test filtering logic
    it('should sort recipes by name using localeCompare', () => {
        const recipes = [
            { recipe: { name: 'Phở bò' } },
            { recipe: { name: 'Bún chả' } },
            { recipe: { name: 'Cơm tấm' } },
        ]

        const sorted = [...recipes].sort((a, b) =>
            a.recipe.name.localeCompare(b.recipe.name, 'vi')
        )

        expect(sorted[0].recipe.name).toBe('Bún chả')
        expect(sorted[1].recipe.name).toBe('Cơm tấm')
        expect(sorted[2].recipe.name).toBe('Phở bò')
    })

    it('should sort recipes by rating descending', () => {
        const recipes = [
            { recipe: { rating: 3.5 } },
            { recipe: { rating: 4.8 } },
            { recipe: { rating: null } },
            { recipe: { rating: 4.2 } },
        ]

        const sorted = [...recipes].sort((a, b) => {
            const aRating = a.recipe.rating ?? 0
            const bRating = b.recipe.rating ?? 0
            return bRating - aRating
        })

        expect(sorted[0].recipe.rating).toBe(4.8)
        expect(sorted[1].recipe.rating).toBe(4.2)
        expect(sorted[2].recipe.rating).toBe(3.5)
        expect(sorted[3].recipe.rating).toBeNull()
    })
})
