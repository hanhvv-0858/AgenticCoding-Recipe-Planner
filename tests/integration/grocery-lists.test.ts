/**
 * Phase 9 Integration Tests: Grocery List (T222-T226)
 */

const {
    generateGroceryListSchema,
    toggleGroceryItemSchema,
    addCustomGroceryItemSchema,
    updateGroceryItemSchema,
    deleteGroceryItemSchema,
    CATEGORY_LABELS,
    CATEGORY_ICONS,
    CATEGORY_ORDER,
    INGREDIENT_CATEGORIES,
} = require('@/lib/validations/grocery-list')

const {
    mergeIngredients,
    getUnitType,
    areUnitsCompatible,
    convertToBaseUnit,
    formatSourceNotes,
    generateShareText,
} = require('@/lib/utils/merge-ingredients')

describe('Grocery List Validation Schemas', () => {
    describe('generateGroceryListSchema', () => {
        it('should accept valid date range', () => {
            const result = generateGroceryListSchema.parse({
                startDate: '2024-12-09',
                endDate: '2024-12-15',
            })
            expect(result.startDate).toBe('2024-12-09')
            expect(result.endDate).toBe('2024-12-15')
        })

        it('should reject invalid date format', () => {
            expect(() => generateGroceryListSchema.parse({
                startDate: '12/09/2024',
                endDate: '2024-12-15',
            })).toThrow()
        })
    })

    describe('toggleGroceryItemSchema', () => {
        it('should accept valid toggle', () => {
            const result = toggleGroceryItemSchema.parse({
                itemId: '550e8400-e29b-41d4-a716-446655440000',
                isChecked: true,
            })
            expect(result.isChecked).toBe(true)
        })

        it('should reject invalid UUID', () => {
            expect(() => toggleGroceryItemSchema.parse({
                itemId: 'not-a-uuid',
                isChecked: true,
            })).toThrow()
        })
    })

    describe('addCustomGroceryItemSchema', () => {
        it('should accept valid custom item', () => {
            const result = addCustomGroceryItemSchema.parse({
                customName: 'Dầu ăn',
                quantity: 500,
                unit: 'ml',
            })
            expect(result.customName).toBe('Dầu ăn')
            expect(result.quantity).toBe(500)
            expect(result.category).toBe('other') // default
        })

        it('should accept item with category', () => {
            const result = addCustomGroceryItemSchema.parse({
                customName: 'Cà rốt',
                quantity: 3,
                unit: 'củ',
                category: 'vegetables',
            })
            expect(result.category).toBe('vegetables')
        })

        it('should reject empty name', () => {
            expect(() => addCustomGroceryItemSchema.parse({
                customName: '',
                quantity: 1,
                unit: 'cái',
            })).toThrow()
        })

        it('should reject quantity <= 0', () => {
            expect(() => addCustomGroceryItemSchema.parse({
                customName: 'item',
                quantity: 0,
                unit: 'g',
            })).toThrow()
        })

        it('should reject invalid category', () => {
            expect(() => addCustomGroceryItemSchema.parse({
                customName: 'item',
                quantity: 1,
                unit: 'g',
                category: 'invalid_category',
            })).toThrow()
        })
    })

    describe('updateGroceryItemSchema', () => {
        it('should accept valid update', () => {
            const result = updateGroceryItemSchema.parse({
                itemId: '550e8400-e29b-41d4-a716-446655440000',
                quantity: 5,
            })
            expect(result.quantity).toBe(5)
        })
    })

    describe('deleteGroceryItemSchema', () => {
        it('should accept valid UUID', () => {
            const result = deleteGroceryItemSchema.parse({
                itemId: '550e8400-e29b-41d4-a716-446655440000',
            })
            expect(result.itemId).toBe('550e8400-e29b-41d4-a716-446655440000')
        })
    })
})

describe('Grocery List Constants', () => {
    it('should have labels for all categories', () => {
        for (const cat of INGREDIENT_CATEGORIES) {
            expect(CATEGORY_LABELS[cat]).toBeTruthy()
        }
    })

    it('should have icons for all categories', () => {
        for (const cat of INGREDIENT_CATEGORIES) {
            expect(CATEGORY_ICONS[cat]).toBeTruthy()
        }
    })

    it('should have order for all categories', () => {
        for (const cat of INGREDIENT_CATEGORIES) {
            expect(typeof CATEGORY_ORDER[cat]).toBe('number')
        }
    })

    it('should have correct Vietnamese labels', () => {
        expect(CATEGORY_LABELS.vegetables).toBe('Rau củ')
        expect(CATEGORY_LABELS.meat).toBe('Thịt')
        expect(CATEGORY_LABELS.seasonings).toBe('Gia vị')
    })
})

describe('Ingredient Merging (T222-T224)', () => {
    describe('T222: mergeIngredients merges duplicate ingredients', () => {
        it('should merge same ingredient with same unit', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Cà rốt',
                    quantity: 200,
                    unit: 'g',
                    category: 'vegetables',
                    recipeName: 'Canh rau',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Cà rốt',
                    quantity: 150,
                    unit: 'g',
                    category: 'vegetables',
                    recipeName: 'Xào rau',
                    mealPlanEntryId: 'mp-2',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(1)
            expect(result[0].totalQuantity).toBe(350)
            expect(result[0].displayUnit).toBe('g')
            expect(result[0].sourceRecipes).toContain('Canh rau')
            expect(result[0].sourceRecipes).toContain('Xào rau')
        })

        it('should keep different ingredients separate', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Cà rốt',
                    quantity: 200,
                    unit: 'g',
                    category: 'vegetables',
                    recipeName: 'Canh',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-2',
                    ingredientName: 'Khoai tây',
                    quantity: 300,
                    unit: 'g',
                    category: 'vegetables',
                    recipeName: 'Canh',
                    mealPlanEntryId: 'mp-1',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(2)
        })
    })

    describe('T223: Smart merging handles unit conversions', () => {
        it('should convert and merge compatible weight units (g + kg)', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Thịt bò',
                    quantity: 500,
                    unit: 'g',
                    category: 'meat',
                    recipeName: 'Phở',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Thịt bò',
                    quantity: 1,
                    unit: 'kg',
                    category: 'meat',
                    recipeName: 'Bò kho',
                    mealPlanEntryId: 'mp-2',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(1)
            // 500g + 1000g = 1500g
            expect(result[0].totalQuantity).toBe(1500)
            expect(result[0].displayUnit).toBe('g')
        })

        it('should convert and merge compatible volume units (ml + l)', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Nước dùng',
                    quantity: 500,
                    unit: 'ml',
                    category: 'other',
                    recipeName: 'Canh',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Nước dùng',
                    quantity: 2,
                    unit: 'l',
                    category: 'other',
                    recipeName: 'Phở',
                    mealPlanEntryId: 'mp-2',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(1)
            // 500ml + 2000ml = 2500ml
            expect(result[0].totalQuantity).toBe(2500)
            expect(result[0].displayUnit).toBe('ml')
        })

        it('should NOT merge incompatible units (g vs ml)', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Mật ong',
                    quantity: 50,
                    unit: 'g',
                    category: 'condiments',
                    recipeName: 'Món A',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Mật ong',
                    quantity: 30,
                    unit: 'ml',
                    category: 'condiments',
                    recipeName: 'Món B',
                    mealPlanEntryId: 'mp-2',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(2)
        })

        it('should merge count units', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Trứng gà',
                    quantity: 3,
                    unit: 'quả',
                    category: 'dairy',
                    recipeName: 'Trứng chiên',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Trứng gà',
                    quantity: 2,
                    unit: 'quả',
                    category: 'dairy',
                    recipeName: 'Bánh flan',
                    mealPlanEntryId: 'mp-2',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(1)
            expect(result[0].totalQuantity).toBe(5)
        })
    })

    describe('T224: Recipe source tracking works correctly', () => {
        it('should track all source recipes', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Hành tím',
                    quantity: 2,
                    unit: 'củ',
                    category: 'vegetables',
                    recipeName: 'Canh chua',
                    mealPlanEntryId: 'mp-1',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Hành tím',
                    quantity: 3,
                    unit: 'củ',
                    category: 'vegetables',
                    recipeName: 'Cá kho',
                    mealPlanEntryId: 'mp-2',
                },
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Hành tím',
                    quantity: 1,
                    unit: 'củ',
                    category: 'vegetables',
                    recipeName: 'Thịt kho',
                    mealPlanEntryId: 'mp-3',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result).toHaveLength(1)
            expect(result[0].totalQuantity).toBe(6)
            expect(result[0].sourceRecipes).toEqual(
                expect.arrayContaining(['Canh chua', 'Cá kho', 'Thịt kho'])
            )
            expect(result[0].sourceMealPlanIds).toHaveLength(3)
        })

        it('should track meal plan entry IDs', () => {
            const entries = [
                {
                    ingredientId: 'ing-1',
                    ingredientName: 'Muối',
                    quantity: 5,
                    unit: 'g',
                    category: 'seasonings',
                    recipeName: 'Món A',
                    mealPlanEntryId: 'mp-100',
                },
            ]

            const result = mergeIngredients(entries)
            expect(result[0].sourceMealPlanIds).toContain('mp-100')
        })
    })
})

describe('Unit Type Detection', () => {
    it('should detect weight units', () => {
        expect(getUnitType('g')).toBe('weight')
        expect(getUnitType('kg')).toBe('weight')
        expect(getUnitType('oz')).toBe('weight')
        expect(getUnitType('lb')).toBe('weight')
    })

    it('should detect volume units', () => {
        expect(getUnitType('ml')).toBe('volume')
        expect(getUnitType('l')).toBe('volume')
        expect(getUnitType('cup')).toBe('volume')
        expect(getUnitType('tbsp')).toBe('volume')
        expect(getUnitType('tsp')).toBe('volume')
    })

    it('should detect count units', () => {
        expect(getUnitType('quả')).toBe('count')
        expect(getUnitType('cái')).toBe('count')
        expect(getUnitType('củ')).toBe('count')
        expect(getUnitType('pieces')).toBe('count')
    })

    it('should return unknown for unrecognized units', () => {
        expect(getUnitType('xyz')).toBe('unknown')
    })
})

describe('Unit Compatibility', () => {
    it('should say weight units are compatible', () => {
        expect(areUnitsCompatible('g', 'kg')).toBe(true)
    })

    it('should say volume units are compatible', () => {
        expect(areUnitsCompatible('ml', 'l')).toBe(true)
    })

    it('should say weight and volume are NOT compatible', () => {
        expect(areUnitsCompatible('g', 'ml')).toBe(false)
    })

    it('should say same unknown units are compatible', () => {
        expect(areUnitsCompatible('foo', 'foo')).toBe(true)
    })

    it('should say different unknown units are NOT compatible', () => {
        expect(areUnitsCompatible('foo', 'bar')).toBe(false)
    })
})

describe('Unit Conversion', () => {
    it('should convert kg to grams', () => {
        const result = convertToBaseUnit(2, 'kg')
        expect(result.quantity).toBe(2000)
        expect(result.baseUnit).toBe('g')
    })

    it('should convert l to ml', () => {
        const result = convertToBaseUnit(1.5, 'l')
        expect(result.quantity).toBe(1500)
        expect(result.baseUnit).toBe('ml')
    })

    it('should keep count units unchanged', () => {
        const result = convertToBaseUnit(3, 'quả')
        expect(result.quantity).toBe(3)
        expect(result.baseUnit).toBe('quả')
    })
})

describe('Format Source Notes', () => {
    it('should format single recipe source', () => {
        expect(formatSourceNotes(['Phở'])).toBe('Cho món: Phở')
    })

    it('should format multiple recipe sources', () => {
        expect(formatSourceNotes(['Phở', 'Bún bò'])).toBe('Cho 2 món: Phở, Bún bò')
    })

    it('should handle empty array', () => {
        expect(formatSourceNotes([])).toBe('')
    })
})

describe('Share Text Generation', () => {
    it('should generate shareable text with only unchecked items', () => {
        const groups = [
            {
                label: 'Rau củ',
                items: [
                    { item_name: 'Cà rốt', quantity: 200, unit: 'g', is_checked: false },
                    { item_name: 'Bắp cải', quantity: 1, unit: 'cái', is_checked: true },
                ],
            },
            {
                label: 'Thịt',
                items: [
                    { item_name: 'Thịt bò', quantity: 500, unit: 'g', is_checked: false },
                ],
            },
        ]

        const text = generateShareText(groups)
        expect(text).toContain('🛒 Danh sách mua sắm')
        expect(text).toContain('Cà rốt')
        expect(text).not.toContain('Bắp cải') // checked item excluded
        expect(text).toContain('Thịt bò')
    })

    it('should skip groups with all checked items', () => {
        const groups = [
            {
                label: 'Rau củ',
                items: [
                    { item_name: 'Cà rốt', quantity: 200, unit: 'g', is_checked: true },
                ],
            },
        ]

        const text = generateShareText(groups)
        expect(text).not.toContain('Rau củ')
    })
})
