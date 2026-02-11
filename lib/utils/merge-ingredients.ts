/**
 * Ingredient Merging Algorithm (T204-T207)
 *
 * Smart merging of ingredients from meal plan with unit conversion.
 * The algorithm groups identical ingredients (by ingredient_id) from multiple
 * recipes/meal plan entries, then converts compatible units (e.g. grams + kg)
 * into a common base unit before summing quantities. Incompatible units
 * (e.g. weight vs volume) are kept as separate line items.
 *
 * Flow:
 *  1. Group entries by ingredient_id (or custom name fallback)
 *  2. Sub-group each ingredient group by unit compatibility
 *  3. Convert quantities to base units (g / ml), sum, then convert back
 *     to the best display unit
 *  4. Track source recipe names for provenance
 */

/**
 * Conversion factors to base unit: grams.
 * Each key maps a recognized unit string to its gram-equivalent multiplier.
 */
const WEIGHT_CONVERSIONS: Record<string, number> = {
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 1000,
    'kilogram': 1000,
    'oz': 28.3495,
    'ounce': 28.3495,
    'lb': 453.592,
    'pound': 453.592,
}

/**
 * Conversion factors to base unit: milliliters.
 * Each key maps a recognized volume unit string to its ml-equivalent multiplier.
 */
const VOLUME_CONVERSIONS: Record<string, number> = {
    'ml': 1,
    'milliliter': 1,
    'l': 1000,
    'liter': 1000,
    'cup': 236.588,
    'cups': 236.588,
    'tbsp': 14.787,
    'tablespoon': 14.787,
    'tsp': 4.929,
    'teaspoon': 4.929,
}

/**
 * Discrete / countable units that cannot be converted to weight or volume.
 * Includes both English and Vietnamese unit names.
 */
const COUNT_UNITS = new Set([
    'pieces', 'piece', 'cái', 'quả', 'trái', 'con', 'lá', 'nhánh',
    'bó', 'củ', 'miếng', 'lát', 'tép', 'múi', 'whole', 'clove',
    'cloves', 'head', 'stalk', 'bunch',
])

export type UnitType = 'weight' | 'volume' | 'count' | 'unknown'

/**
 * Classify a unit string into one of the known categories.
 *
 * Used by the merging algorithm to decide whether two ingredients
 * can be summed together (same category = compatible).
 *
 * @param unit - Raw unit string from a recipe ingredient (e.g. "g", "cup", "cái")
 * @returns The unit category: 'weight', 'volume', 'count', or 'unknown'
 */
export function getUnitType(unit: string): UnitType {
    const normalized = unit.toLowerCase().trim()
    if (WEIGHT_CONVERSIONS[normalized]) return 'weight'
    if (VOLUME_CONVERSIONS[normalized]) return 'volume'
    if (COUNT_UNITS.has(normalized)) return 'count'
    return 'unknown'
}

/**
 * Check whether two unit strings are compatible for quantity merging.
 *
 * Units are compatible if:
 * - They belong to the same known category (both weight, both volume, or both count), OR
 * - They are identical strings (handles unknown-but-matching units like "bunch").
 *
 * @param unit1 - First unit string
 * @param unit2 - Second unit string
 * @returns `true` if quantities with these units can be summed after conversion
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
    const type1 = getUnitType(unit1)
    const type2 = getUnitType(unit2)

    if (type1 === type2 && type1 !== 'unknown') return true
    if (unit1.toLowerCase().trim() === unit2.toLowerCase().trim()) return true
    return false
}

/**
 * Convert a quantity to its canonical base unit for arithmetic.
 *
 * Weight units are normalised to grams (g), volume units to millilitres (ml).
 * Count or unknown units are returned unchanged.
 *
 * @param quantity - The numeric amount to convert
 * @param unit - The source unit string (e.g. "kg", "cup", "pieces")
 * @returns An object with the converted `quantity` and the `baseUnit` string
 */
export function convertToBaseUnit(quantity: number, unit: string): { quantity: number; baseUnit: string } {
    const normalized = unit.toLowerCase().trim()

    if (WEIGHT_CONVERSIONS[normalized]) {
        return { quantity: quantity * WEIGHT_CONVERSIONS[normalized], baseUnit: 'g' }
    }
    if (VOLUME_CONVERSIONS[normalized]) {
        return { quantity: quantity * VOLUME_CONVERSIONS[normalized], baseUnit: 'ml' }
    }
    return { quantity, baseUnit: unit }
}

/**
 * Choose the most user-friendly display unit when merging two entries.
 *
 * Uses a preferred-order list so that simpler/more common units win.
 * For example, if one entry uses "g" and another uses "kg", "g" wins
 * because it appears earlier in the preferred list.
 *
 * @param unit1 - First candidate unit
 * @param unit2 - Second candidate unit
 * @returns The preferred display unit string
 */
function pickDisplayUnit(unit1: string, unit2: string): string {
    const preferredOrder = ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'pieces', 'cái', 'quả']
    const norm1 = unit1.toLowerCase().trim()
    const norm2 = unit2.toLowerCase().trim()
    const idx1 = preferredOrder.indexOf(norm1)
    const idx2 = preferredOrder.indexOf(norm2)
    if (idx1 >= 0 && idx2 >= 0) return idx1 <= idx2 ? unit1 : unit2
    if (idx1 >= 0) return unit1
    if (idx2 >= 0) return unit2
    return unit1
}

/**
 * Represent a single ingredient entry before merging
 */
export type IngredientEntry = {
    ingredientId: string | null
    ingredientName: string
    quantity: number
    unit: string
    category: string
    recipeName: string
    mealPlanEntryId: string
    iconEmoji?: string | null
}

/**
 * Represent a merged ingredient result
 */
export type MergedIngredient = {
    ingredientId: string | null
    ingredientName: string
    totalQuantity: number
    displayUnit: string
    category: string
    sourceRecipes: string[]
    sourceMealPlanIds: string[]
    iconEmoji: string | null
}

/**
 * Main smart-merge algorithm for grocery list generation.
 *
 * Given a flat list of ingredient entries (potentially from many recipes and meal
 * plan entries), this function:
 *  1. Groups entries by `ingredientId` (falls back to lowercased name for custom items).
 *  2. Within each ingredient group, creates sub-groups of unit-compatible entries
 *     (e.g. "g" and "kg" go together; "g" and "ml" do not).
 *  3. For weight/volume sub-groups, converts every entry to the base unit (g or ml),
 *     sums the totals, then converts back to the best display unit.
 *  4. For count/unknown sub-groups, simply sums the raw quantities.
 *  5. Collects source recipe names and meal plan IDs so the UI can show provenance.
 *
 * @param entries - Flat array of ingredient entries from one or more recipes
 * @returns Array of merged ingredients, each with a summed quantity and display unit
 *
 * @example
 * // Two entries: 500g chicken + 1kg chicken → 1500g chicken (displayed as 1500 g)
 * mergeIngredients([entry500g, entry1kg])
 */
export function mergeIngredients(entries: IngredientEntry[]): MergedIngredient[] {
    // Step 1: Group entries by ingredient identity
    const groups = new Map<string, IngredientEntry[]>()

    for (const entry of entries) {
        // Use ingredient_id when available; fall back to lowercased name for custom items
        const key = entry.ingredientId ?? `custom:${entry.ingredientName.toLowerCase()}`
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(entry)
    }

    const merged: MergedIngredient[] = []

    for (const [, groupEntries] of groups) {
        // Step 2: Sub-group by unit compatibility so incompatible units
        // (e.g. weight vs count) produce separate merged entries
        const unitGroups: IngredientEntry[][] = []

        for (const entry of groupEntries) {
            let placed = false
            for (const ug of unitGroups) {
                if (areUnitsCompatible(ug[0].unit, entry.unit)) {
                    ug.push(entry)
                    placed = true
                    break
                }
            }
            if (!placed) {
                unitGroups.push([entry])
            }
        }

        // Step 3: Merge each unit-compatible sub-group
        for (const ug of unitGroups) {
            const first = ug[0]
            const unitType = getUnitType(first.unit)

            let totalQuantity = 0
            let displayUnit = first.unit
            const sourceRecipes = new Set<string>()
            const sourceMealPlanIds = new Set<string>()

            if (unitType === 'weight' || unitType === 'volume') {
                // Convert all entries to base unit (g or ml), then sum
                for (const entry of ug) {
                    const converted = convertToBaseUnit(entry.quantity, entry.unit)
                    totalQuantity += converted.quantity
                    sourceRecipes.add(entry.recipeName)
                    sourceMealPlanIds.add(entry.mealPlanEntryId)
                    displayUnit = pickDisplayUnit(displayUnit, entry.unit)
                }

                // Convert summed base-unit total back to the chosen display unit
                const displayConversion = unitType === 'weight'
                    ? WEIGHT_CONVERSIONS[displayUnit.toLowerCase().trim()] ?? 1
                    : VOLUME_CONVERSIONS[displayUnit.toLowerCase().trim()] ?? 1
                totalQuantity = totalQuantity / displayConversion
            } else {
                // Count / unknown units — just sum raw quantities
                for (const entry of ug) {
                    totalQuantity += entry.quantity
                    sourceRecipes.add(entry.recipeName)
                    sourceMealPlanIds.add(entry.mealPlanEntryId)
                }
            }

            // Round to 2 decimal places to avoid floating-point noise
            totalQuantity = Math.round(totalQuantity * 100) / 100

            merged.push({
                ingredientId: first.ingredientId,
                ingredientName: first.ingredientName,
                totalQuantity,
                displayUnit,
                category: first.category,
                sourceRecipes: Array.from(sourceRecipes),
                sourceMealPlanIds: Array.from(sourceMealPlanIds),
                iconEmoji: first.iconEmoji ?? null,
            })
        }
    }

    return merged
}

/**
 * Group merged ingredients by their food category for display.
 *
 * Ingredients with a falsy category default to 'other'.
 *
 * @param ingredients - Array of merged ingredients to group
 * @returns Map keyed by category string, values are arrays of ingredients in that category
 */
export function groupByCategory(
    ingredients: MergedIngredient[]
): Map<string, MergedIngredient[]> {
    const grouped = new Map<string, MergedIngredient[]>()
    for (const ingredient of ingredients) {
        const category = ingredient.category || 'other'
        if (!grouped.has(category)) {
            grouped.set(category, [])
        }
        grouped.get(category)!.push(ingredient)
    }
    return grouped
}

/**
 * Category display order for grocery list
 */
export const CATEGORY_ORDER: Record<string, number> = {
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
 * Category names in Vietnamese
 */
export const CATEGORY_NAMES: Record<string, string> = {
    vegetables: 'Rau củ',
    fruits: 'Trái cây',
    meat: 'Thịt',
    seafood: 'Hải sản',
    dairy: 'Sữa & Phô mai',
    grains: 'Ngũ cốc',
    seasonings: 'Gia vị',
    condiments: 'Nước chấm',
    baking: 'Nguyên liệu nướng',
    other: 'Khác',
}

/**
 * Format a human-readable note listing which recipes require this ingredient.
 *
 * @param sourceRecipes - Array of recipe names that contributed to the merged ingredient
 * @returns A Vietnamese-language string like "Cho món: Phở" or "Cho 3 món: A, B, C",
 *          or an empty string if no sources.
 */
export function formatSourceNotes(sourceRecipes: string[]): string {
    if (sourceRecipes.length === 0) return ''
    if (sourceRecipes.length === 1) return `Cho món: ${sourceRecipes[0]}`
    return `Cho ${sourceRecipes.length} món: ${sourceRecipes.join(', ')}`
}

/**
 * Format a single merged ingredient as a compact display string.
 *
 * @param ingredient - The merged ingredient to format
 * @returns A string like "Chicken - 500 g"
 */
export function formatIngredientDisplay(ingredient: MergedIngredient): string {
    return `${ingredient.ingredientName} - ${ingredient.totalQuantity} ${ingredient.displayUnit}`
}

/**
 * Generate a plain-text shareable grocery list.
 *
 * Only unchecked (not-yet-purchased) items are included.
 * Each category group becomes a section with a header emoji.
 * The output is suitable for copying to clipboard or sharing via messaging apps.
 *
 * @param groups - Category-grouped grocery items with check status
 * @returns A multi-line Unicode string ready for sharing
 */
export function generateShareText(
    groups: { label: string; items: { item_name: string; quantity: number; unit: string; is_checked: boolean }[] }[]
): string {
    const lines: string[] = ['🛒 Danh sách mua sắm', '']

    for (const group of groups) {
        // Skip categories where everything has already been purchased
        const unchecked = group.items.filter(i => !i.is_checked)
        if (unchecked.length === 0) continue
        lines.push(`📌 ${group.label}`)
        for (const item of unchecked) {
            lines.push(`  ☐ ${item.item_name} — ${item.quantity} ${item.unit}`)
        }
        lines.push('')
    }

    return lines.join('\n').trim()
}
