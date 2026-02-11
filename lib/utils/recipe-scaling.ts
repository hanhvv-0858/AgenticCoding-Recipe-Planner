/**
 * T114: Recipe Servings Scaling Logic
 *
 * Scales ingredient quantities proportionally when the user adjusts servings.
 * Uses adaptive rounding so small quantities keep more precision while large
 * quantities are rounded to cleaner numbers.
 */

import type { RecipeIngredientData } from '@/lib/validations/recipe'

/** Extended ingredient type that includes the computed scaled quantity. */
export interface ScaledIngredient extends RecipeIngredientData {
    scaled_quantity: number
}

/**
 * Scale a single ingredient quantity by the servings ratio.
 *
 * Applies adaptive rounding to keep output practical for cooking:
 *   - ≥ 100 → round to nearest integer  (e.g. 150 g)
 *   - ≥ 10  → round to 1 decimal place   (e.g. 12.5 ml)
 *   - < 10  → round to 2 decimal places  (e.g. 0.75 tsp)
 *
 * @param originalQuantity - Quantity from the base recipe
 * @param originalServings - Servings the recipe was written for
 * @param targetServings   - Desired servings count
 * @returns Scaled and rounded quantity; returns original if either servings value ≤ 0
 */
export function scaleIngredientQuantity(
    originalQuantity: number,
    originalServings: number,
    targetServings: number
): number {
    if (originalServings <= 0 || targetServings <= 0) return originalQuantity
    const ratio = targetServings / originalServings
    const scaled = originalQuantity * ratio
    // Adaptive rounding: more precision for smaller values
    if (scaled >= 100) return Math.round(scaled)
    if (scaled >= 10) return Math.round(scaled * 10) / 10
    return Math.round(scaled * 100) / 100
}

/**
 * Scale every ingredient in a recipe by applying {@link scaleIngredientQuantity}.
 *
 * Returns a new array; the original ingredients array is not mutated.
 * Each result includes all original fields plus a `scaled_quantity`.
 *
 * @param ingredients      - The recipe’s ingredient list
 * @param originalServings - Servings the recipe was written for
 * @param targetServings   - Desired servings count
 * @returns New array of ingredients with `scaled_quantity` added
 */
export function scaleRecipeIngredients(
    ingredients: RecipeIngredientData[],
    originalServings: number,
    targetServings: number
): ScaledIngredient[] {
    return ingredients.map(ingredient => ({
        ...ingredient,
        scaled_quantity: scaleIngredientQuantity(
            ingredient.quantity,
            originalServings,
            targetServings
        ),
    }))
}

/**
 * Compute total macro / calorie values for a given number of servings.
 *
 * The input nutrition is assumed to be *per single serving*. The function
 * multiplies each value by `targetServings` to get totals. Null values
 * propagate as null (no data).
 *
 * @param nutrition        - Per-serving nutritional breakdown
 * @param originalServings - (Unused guard — returns null-object when ≤ 0)
 * @param targetServings   - Number of servings to calculate totals for
 * @returns An object with total calories, protein, carbs, and fat
 */
export function scaleNutritionForServings(
    nutrition: {
        calories_per_serving: number | null
        protein_grams: number | null
        carbs_grams: number | null
        fat_grams: number | null
    },
    originalServings: number,
    targetServings: number
): {
    totalCalories: number | null
    totalProtein: number | null
    totalCarbs: number | null
    totalFat: number | null
} {
    if (originalServings <= 0 || targetServings <= 0) {
        return { totalCalories: null, totalProtein: null, totalCarbs: null, totalFat: null }
    }

    // Helper: multiply a nullable value by target servings, rounding to nearest integer
    const scale = (val: number | null) => {
        if (val === null) return null
        return Math.round(val * targetServings)
    }

    return {
        totalCalories: scale(nutrition.calories_per_serving),
        totalProtein: scale(nutrition.protein_grams),
        totalCarbs: scale(nutrition.carbs_grams),
        totalFat: scale(nutrition.fat_grams),
    }
}

/**
 * Format a numeric quantity for human-friendly display.
 *
 * Special-cases common cooking fractions (¼, ⅓, ½, ⅔, ¾) so that e.g.
 * `1.5` renders as "1 ½" instead of "1.50". Trailing zeros are stripped.
 *
 * @param quantity - The numeric amount to format
 * @returns A display string, potentially using Unicode fraction characters
 *
 * @example
 * formatQuantity(1.5)   // "1 ½"
 * formatQuantity(2)     // "2"
 * formatQuantity(0.33)  // "⅓"
 * formatQuantity(3.14)  // "3.14"
 */
export function formatQuantity(quantity: number): string {
    if (Number.isInteger(quantity)) return quantity.toString()
    // Map common decimal fractions to their Unicode vulgar fraction glyphs
    const fractions: Record<string, string> = {
        '0.25': '¼',
        '0.33': '⅓',
        '0.5': '½',
        '0.67': '⅔',
        '0.75': '¾',
    }
    // Extract the fractional part with 2-decimal precision and look up a glyph
    const decimal = parseFloat((quantity % 1).toFixed(2)).toString()
    const whole = Math.floor(quantity)
    const fraction = fractions[decimal]
    if (fraction) {
        // Combine whole number and fraction glyph (e.g. "1 ½"), or fraction alone (e.g. "½")
        return whole > 0 ? `${whole} ${fraction}` : fraction
    }
    // Fallback: standard decimal with trailing-zero removal
    return quantity.toFixed(quantity >= 10 ? 1 : 2).replace(/\.?0+$/, '')
}
