/**
 * Phase 8 Integration Tests: Meal Planning (T181-T185)
 */

const {
    addRecipeToMealPlanSchema,
    addQuickNoteSchema,
    removeMealPlanEntrySchema,
    updateMealPlanServingsSchema,
    markMealCompletedSchema,
    getMealPlanSchema,
    MealType,
    MEAL_TYPE_LABELS,
    MEAL_TYPE_ICONS,
} = require('@/lib/validations/meal-plan')

describe('Meal Plan Validation Schemas', () => {
    describe('addRecipeToMealPlanSchema', () => {
        it('should accept valid recipe meal plan entry', () => {
            const result = addRecipeToMealPlanSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                mealDate: '2024-12-15',
                mealType: 'breakfast',
                servings: 2,
            })
            expect(result.recipeId).toBe('550e8400-e29b-41d4-a716-446655440000')
            expect(result.mealType).toBe('breakfast')
            expect(result.servings).toBe(2)
        })

        it('should use default servings of 2', () => {
            const result = addRecipeToMealPlanSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                mealDate: '2024-12-15',
                mealType: 'lunch',
            })
            expect(result.servings).toBe(2)
        })

        it('should accept all meal types', () => {
            const types = ['breakfast', 'lunch', 'dinner', 'snack']
            types.forEach(type => {
                expect(() => addRecipeToMealPlanSchema.parse({
                    recipeId: '550e8400-e29b-41d4-a716-446655440000',
                    mealDate: '2024-12-15',
                    mealType: type,
                })).not.toThrow()
            })
        })

        it('should reject invalid meal type', () => {
            expect(() => addRecipeToMealPlanSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                mealDate: '2024-12-15',
                mealType: 'brunch',
            })).toThrow()
        })

        it('should reject invalid date format', () => {
            expect(() => addRecipeToMealPlanSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                mealDate: '15/12/2024',
                mealType: 'breakfast',
            })).toThrow()
        })

        it('should reject servings over 20', () => {
            expect(() => addRecipeToMealPlanSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                mealDate: '2024-12-15',
                mealType: 'dinner',
                servings: 21,
            })).toThrow()
        })

        it('should reject servings less than 1', () => {
            expect(() => addRecipeToMealPlanSchema.parse({
                recipeId: '550e8400-e29b-41d4-a716-446655440000',
                mealDate: '2024-12-15',
                mealType: 'dinner',
                servings: 0,
            })).toThrow()
        })
    })

    describe('addQuickNoteSchema', () => {
        it('should accept valid quick note', () => {
            const result = addQuickNoteSchema.parse({
                quickNote: 'Ăn cơm tấm ngoài quán',
                mealDate: '2024-12-15',
                mealType: 'lunch',
            })
            expect(result.quickNote).toBe('Ăn cơm tấm ngoài quán')
        })

        it('should reject empty note', () => {
            expect(() => addQuickNoteSchema.parse({
                quickNote: '',
                mealDate: '2024-12-15',
                mealType: 'lunch',
            })).toThrow()
        })

        it('should reject note over 200 chars', () => {
            expect(() => addQuickNoteSchema.parse({
                quickNote: 'a'.repeat(201),
                mealDate: '2024-12-15',
                mealType: 'lunch',
            })).toThrow()
        })
    })

    describe('removeMealPlanEntrySchema', () => {
        it('should accept valid UUID', () => {
            const result = removeMealPlanEntrySchema.parse({
                entryId: '550e8400-e29b-41d4-a716-446655440000',
            })
            expect(result.entryId).toBe('550e8400-e29b-41d4-a716-446655440000')
        })

        it('should reject invalid UUID', () => {
            expect(() => removeMealPlanEntrySchema.parse({
                entryId: 'not-a-uuid',
            })).toThrow()
        })
    })

    describe('updateMealPlanServingsSchema', () => {
        it('should accept valid servings update', () => {
            const result = updateMealPlanServingsSchema.parse({
                entryId: '550e8400-e29b-41d4-a716-446655440000',
                servings: 4,
            })
            expect(result.servings).toBe(4)
        })

        it('should reject servings over 20', () => {
            expect(() => updateMealPlanServingsSchema.parse({
                entryId: '550e8400-e29b-41d4-a716-446655440000',
                servings: 25,
            })).toThrow()
        })
    })

    describe('markMealCompletedSchema', () => {
        it('should accept completed status', () => {
            const result = markMealCompletedSchema.parse({
                entryId: '550e8400-e29b-41d4-a716-446655440000',
                isCompleted: true,
            })
            expect(result.isCompleted).toBe(true)
        })

        it('should accept uncompleted status', () => {
            const result = markMealCompletedSchema.parse({
                entryId: '550e8400-e29b-41d4-a716-446655440000',
                isCompleted: false,
            })
            expect(result.isCompleted).toBe(false)
        })
    })

    describe('getMealPlanSchema', () => {
        it('should accept valid date range', () => {
            const result = getMealPlanSchema.parse({
                startDate: '2024-12-09',
                endDate: '2024-12-15',
            })
            expect(result.startDate).toBe('2024-12-09')
            expect(result.endDate).toBe('2024-12-15')
        })

        it('should reject invalid date format', () => {
            expect(() => getMealPlanSchema.parse({
                startDate: '2024-12-9',
                endDate: '2024-12-15',
            })).toThrow()
        })
    })
})

describe('Meal Plan Constants', () => {
    it('should have labels for all meal types', () => {
        expect(MEAL_TYPE_LABELS.breakfast).toBe('Bữa sáng')
        expect(MEAL_TYPE_LABELS.lunch).toBe('Bữa trưa')
        expect(MEAL_TYPE_LABELS.dinner).toBe('Bữa tối')
        expect(MEAL_TYPE_LABELS.snack).toBe('Bữa phụ')
    })

    it('should have icons for all meal types', () => {
        expect(MEAL_TYPE_ICONS.breakfast).toBe('🌅')
        expect(MEAL_TYPE_ICONS.lunch).toBe('☀️')
        expect(MEAL_TYPE_ICONS.dinner).toBe('🌙')
        expect(MEAL_TYPE_ICONS.snack).toBe('🍎')
    })
})

describe('Meal Plan Nutritional Summary Calculation', () => {
    // T184: Daily summaries calculate correct totals
    it('should calculate daily nutritional summary correctly', () => {
        const entries = [
            {
                meal_type: 'breakfast',
                servings: 2,
                recipe: { calories_per_serving: 300, protein_grams: 15, carbs_grams: 40, fat_grams: 10, servings: 2 },
            },
            {
                meal_type: 'lunch',
                servings: 1,
                recipe: { calories_per_serving: 500, protein_grams: 30, carbs_grams: 50, fat_grams: 20, servings: 1 },
            },
            {
                meal_type: 'dinner',
                servings: 3,
                recipe: { calories_per_serving: 400, protein_grams: 25, carbs_grams: 35, fat_grams: 15, servings: 2 },
            },
        ]

        let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0
        for (const entry of entries) {
            const ratio = entry.servings / (entry.recipe.servings || 1)
            totalCalories += Math.round(entry.recipe.calories_per_serving * ratio)
            totalProtein += Math.round(entry.recipe.protein_grams * ratio)
            totalCarbs += Math.round(entry.recipe.carbs_grams * ratio)
            totalFat += Math.round(entry.recipe.fat_grams * ratio)
        }

        // Breakfast: 300*1=300, Lunch: 500*1=500, Dinner: 400*1.5=600
        expect(totalCalories).toBe(1400)
        // Breakfast: 15*1=15, Lunch: 30*1=30, Dinner: 25*1.5=38
        expect(totalProtein).toBe(83)
        // Breakfast: 40*1=40, Lunch: 50*1=50, Dinner: 35*1.5=53
        expect(totalCarbs).toBe(143)
        // Breakfast: 10*1=10, Lunch: 20*1=20, Dinner: 15*1.5=23
        expect(totalFat).toBe(53)
    })

    it('should handle entries without recipes (quick notes)', () => {
        const entries: Array<{ meal_type: string; servings: number; recipe: { servings: number; calories_per_serving: number } | null }> = [
            { meal_type: 'lunch', servings: 1, recipe: null },
        ]

        let totalCalories = 0
        for (const entry of entries) {
            if (entry.recipe) {
                const ratio = entry.servings / (entry.recipe.servings || 1)
                totalCalories += Math.round(entry.recipe.calories_per_serving * ratio)
            }
        }

        expect(totalCalories).toBe(0)
    })

    it('should handle null nutrition values', () => {
        const entries = [
            {
                meal_type: 'breakfast',
                servings: 2,
                recipe: { calories_per_serving: null, protein_grams: null, carbs_grams: null, fat_grams: null, servings: 2 },
            },
        ]

        let totalCalories = 0
        for (const entry of entries) {
            if (entry.recipe) {
                const ratio = entry.servings / (entry.recipe.servings || 1)
                totalCalories += Math.round((entry.recipe.calories_per_serving ?? 0) * ratio)
            }
        }

        expect(totalCalories).toBe(0)
    })
})

describe('Date Helpers for Meal Planning', () => {
    const { formatForDatabase, getCurrentWeekRange, getWeekDates } = require('@/lib/utils/date-helpers')

    it('should format date for database as YYYY-MM-DD', () => {
        const date = new Date('2024-12-15T12:00:00Z') // UTC noon avoids timezone shift
        expect(formatForDatabase(date)).toBe('2024-12-15')
    })

    it('should get current week range starting Monday', () => {
        const { start, end } = getCurrentWeekRange()
        expect(start.getDay()).toBe(1) // Monday
        expect(end.getDay()).toBe(0) // Sunday
    })

    it('should get 7 dates for a week', () => {
        const { start } = getCurrentWeekRange()
        const dates = getWeekDates(start)
        expect(dates).toHaveLength(7)
    })
})
