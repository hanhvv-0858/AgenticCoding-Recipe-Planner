/**
 * Unit Conversion Utilities
 *
 * Handles conversion between metric and imperial units for recipe ingredients.
 * Wraps the `convert-units` library for standard conversions and provides
 * graceful fallback for non-standard / discrete units (pieces, cloves, etc.).
 */

import configureMeasurements, {
    volume,
    mass,
    VolumeUnits,
    MassUnits,
} from 'convert-units'

/** Pre-configured converter instance supporting volume and mass dimensions. */
const convert = configureMeasurements({
    volume,
    mass,
})

/** The two supported measurement systems for recipes. */
export type UnitSystem = 'metric' | 'imperial'

/** Union of all recognized unit strings, including non-standard cooking units. */
export type Unit = VolumeUnits | MassUnits | 'pieces' | 'cloves' | 'stalks' | 'slices' | 'teaspoons' | 'tablespoons' | 'cups'

/**
 * Convert a quantity from one unit to another.
 *
 * Handles three scenarios:
 *  1. Same unit — returns the quantity unchanged.
 *  2. Non-convertible discrete units (pieces, cloves, etc.) — returns unchanged.
 *  3. Standard weight/volume units — delegates to `convert-units` library.
 *
 * @param quantity - The numeric amount to convert
 * @param fromUnit - Source unit string (e.g. "cups", "g", "lb")
 * @param toUnit   - Target unit string
 * @returns The converted quantity, or the original quantity if conversion is impossible
 */
export function convertUnit(
    quantity: number,
    fromUnit: string,
    toUnit: string
): number {
    // Handle non-convertible units (pieces, cloves, etc.)
    if (fromUnit === toUnit) {
        return quantity
    }

    // Non-standard cooking units have no conversion path — return as-is
    const nonConvertibleUnits = ['pieces', 'cloves', 'stalks', 'slices']
    if (nonConvertibleUnits.includes(fromUnit) || nonConvertibleUnits.includes(toUnit)) {
        return quantity // Cannot convert, return original
    }

    try {
        // Use convert-units library for standard conversions
        return convert(quantity).from(fromUnit as any).to(toUnit as any)
    } catch (error) {
        console.warn(`Cannot convert from ${fromUnit} to ${toUnit}`, error)
        return quantity
    }
}

/**
 * Map a unit to its equivalent in the target measurement system.
 *
 * For example, "cups" in metric becomes "ml", and "g" in imperial becomes "oz".
 * Units not found in the mapping are returned unchanged (e.g. "pieces").
 *
 * @param originalUnit  - The unit string to convert
 * @param targetSystem  - 'metric' or 'imperial'
 * @returns The corresponding unit string in the target system
 */
export function getDefaultUnit(originalUnit: string, targetSystem: UnitSystem): string {
    const metricUnits: Record<string, string> = {
        'cups': 'ml',
        'tablespoons': 'ml',
        'teaspoons': 'ml',
        'oz': 'g',
        'lb': 'kg',
        'fl-oz': 'ml',
    }

    const imperialUnits: Record<string, string> = {
        'ml': 'cups',
        'l': 'cups',
        'g': 'oz',
        'kg': 'lb',
    }

    if (targetSystem === 'metric') {
        return metricUnits[originalUnit] || originalUnit
    } else {
        return imperialUnits[originalUnit] || originalUnit
    }
}

/**
 * Linearly scale an ingredient quantity based on a servings ratio.
 *
 * @param quantity         - Original ingredient quantity
 * @param originalServings - Number of servings the recipe was written for
 * @param targetServings   - Desired number of servings
 * @returns Scaled quantity; returns original if `originalServings` is 0 to prevent division by zero
 */
export function scaleQuantity(
    quantity: number,
    originalServings: number,
    targetServings: number
): number {
    if (originalServings === 0) return quantity
    return (quantity * targetServings) / originalServings
}

/**
 * Format a unit string for display, applying English singular/plural rules.
 *
 * When `quantity` is exactly 1 the singular form is returned (e.g. "piece");
 * otherwise the plural form (e.g. "pieces"). Unknown units pass through unchanged.
 *
 * @param unit     - The unit string to format
 * @param quantity - The associated quantity (used to choose singular vs plural)
 * @returns The correctly inflected unit string
 */
export function formatUnit(unit: string, quantity: number): string {
    // Singular/plural lookup for common cooking units
    const pluralRules: Record<string, string> = {
        'piece': 'pieces',
        'clove': 'cloves',
        'stalk': 'stalks',
        'slice': 'slices',
        'cup': 'cups',
        'tablespoon': 'tablespoons',
        'teaspoon': 'teaspoons',
    }

    if (quantity === 1) {
        // Reverse-lookup: find the singular key whose plural value matches `unit`
        return Object.keys(pluralRules).find(key => pluralRules[key] === unit) || unit
    } else {
        // Forward-lookup: return the plural form, or pass through if not mapped
        return pluralRules[unit] || unit
    }
}

/**
 * Convert all ingredients in a recipe to a target measurement system.
 *
 * Each ingredient's unit is mapped to its system equivalent via {@link getDefaultUnit},
 * then the quantity is converted via {@link convertUnit}. Results are rounded to
 * 2 decimal places for clean display.
 *
 * @param ingredients  - Array of recipe ingredients with id, quantity, and unit
 * @param targetSystem - 'metric' or 'imperial'
 * @returns New array with converted quantities and units (original array is not mutated)
 */
export function convertRecipeUnits(
    ingredients: Array<{
        ingredient_id: string
        quantity: number
        unit: string
    }>,
    targetSystem: UnitSystem
): Array<{
    ingredient_id: string
    quantity: number
    unit: string
}> {
    return ingredients.map((ingredient) => {
        const targetUnit = getDefaultUnit(ingredient.unit, targetSystem)
        const convertedQuantity = convertUnit(
            ingredient.quantity,
            ingredient.unit,
            targetUnit
        )

        return {
            ...ingredient,
            quantity: Math.round(convertedQuantity * 100) / 100, // Round to 2 decimals
            unit: targetUnit,
        }
    })
}
