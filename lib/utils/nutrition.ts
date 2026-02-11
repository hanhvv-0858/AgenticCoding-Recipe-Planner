/**
 * Nutrition Calculation Utilities
 *
 * Calculate, scale, sum, and format nutritional information for recipes and meals.
 * Uses standard Atwater factors for macro-to-calorie conversion:
 *   Protein: 4 kcal/g, Carbohydrates: 4 kcal/g, Fat: 9 kcal/g.
 */

/** Per-serving nutritional breakdown. Nullable fields indicate missing data. */
interface NutritionData {
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
}

/**
 * Estimate total calories from macronutrient grams using Atwater factors.
 *
 * Formula: calories = (protein × 4) + (carbs × 4) + (fat × 9)
 *
 * @param protein - Grams of protein
 * @param carbs   - Grams of carbohydrates
 * @param fat     - Grams of fat
 * @returns Estimated total calories, rounded to the nearest integer
 */
export function calculateCaloriesFromMacros(
    protein: number,
    carbs: number,
    fat: number
): number {
    return Math.round(protein * 4 + carbs * 4 + fat * 9)
}

/**
 * Scale nutrition data proportionally when changing the number of servings.
 *
 * Each macro value is rounded to 1 decimal place; calories are rounded to
 * the nearest integer. Null values remain null (data not available).
 *
 * @param nutrition        - Original per-recipe nutrition information
 * @param originalServings - The serving count the nutrition was calculated for
 * @param targetServings   - Desired serving count
 * @returns A new `NutritionData` object with scaled values
 *
 * @note Returns unmodified nutrition when `originalServings` is 0 (prevents division by zero).
 */
export function scaleNutrition(
    nutrition: NutritionData,
    originalServings: number,
    targetServings: number
): NutritionData {
    if (originalServings === 0) return nutrition

    const scale = targetServings / originalServings

    return {
        calories: nutrition.calories ? Math.round(nutrition.calories * scale) : null,
        protein: nutrition.protein ? Math.round(nutrition.protein * scale * 10) / 10 : null,
        carbs: nutrition.carbs ? Math.round(nutrition.carbs * scale * 10) / 10 : null,
        fat: nutrition.fat ? Math.round(nutrition.fat * scale * 10) / 10 : null,
    }
}

/**
 * Sum nutrition data from multiple sources (e.g. daily meal totals).
 *
 * Treats null values as 0 so that partial data is still accumulated.
 *
 * @param nutritionArray - Array of nutrition records to sum
 * @returns A single `NutritionData` with each field being the sum across all inputs
 */
export function sumNutrition(nutritionArray: NutritionData[]): NutritionData {
    return nutritionArray.reduce(
        (acc, curr) => ({
            calories: (acc.calories || 0) + (curr.calories || 0),
            protein: (acc.protein || 0) + (curr.protein || 0),
            carbs: (acc.carbs || 0) + (curr.carbs || 0),
            fat: (acc.fat || 0) + (curr.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
}

/**
 * Build a compact human-readable nutrition label string.
 *
 * Example output: "450 kcal • Protein: 30g • Carbs: 50g • Fat: 12g"
 * Null fields are omitted from the label.
 *
 * @param nutrition - The nutrition data to format
 * @returns A dot-separated summary string
 */
export function formatNutritionLabel(nutrition: NutritionData): string {
    const parts: string[] = []

    if (nutrition.calories !== null) {
        parts.push(`${nutrition.calories} kcal`)
    }

    if (nutrition.protein !== null) {
        parts.push(`Protein: ${nutrition.protein}g`)
    }

    if (nutrition.carbs !== null) {
        parts.push(`Carbs: ${nutrition.carbs}g`)
    }

    if (nutrition.fat !== null) {
        parts.push(`Fat: ${nutrition.fat}g`)
    }

    return parts.join(' • ')
}

/**
 * Categorise a calorie count into a qualitative tier.
 *
 * Thresholds:
 *   - low:    < 300 kcal
 *   - medium: 300–599 kcal
 *   - high:   ≥ 600 kcal
 *
 * @param calories - Total calorie count
 * @returns 'low', 'medium', or 'high'
 */
export function getNutritionLevel(calories: number): 'low' | 'medium' | 'high' {
    if (calories < 300) return 'low'
    if (calories < 600) return 'medium'
    return 'high'
}

/**
 * Return a Vietnamese display label for a calorie-level tier.
 *
 * @param level - The tier returned by {@link getNutritionLevel}
 * @returns Vietnamese label: "Ít calo", "Trung bình", or "Nhiều calo"
 */
export function getCalorieLevelText(level: 'low' | 'medium' | 'high'): string {
    const labels: Record<string, string> = {
        low: 'Ít calo',
        medium: 'Trung bình',
        high: 'Nhiều calo',
    }
    return labels[level]
}

/**
 * Calculate the percentage of total calories contributed by each macronutrient.
 *
 * Uses the Atwater system: protein and carbs each provide 4 kcal/g, fat provides 9 kcal/g.
 * Percentages are rounded to the nearest integer and may not sum to exactly 100 due to rounding.
 *
 * @param nutrition - Nutrition data with non-null macro values
 * @returns Object with protein, carbs, and fat percentages, or `null` if any macro is missing
 *          or total calories is zero
 */
export function calculateMacroPercentages(nutrition: NutritionData): {
    protein: number
    carbs: number
    fat: number
} | null {
    if (!nutrition.protein || !nutrition.carbs || !nutrition.fat) {
        return null
    }

    const totalCalories =
        nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9

    if (totalCalories === 0) return null

    return {
        protein: Math.round((nutrition.protein * 4 / totalCalories) * 100),
        carbs: Math.round((nutrition.carbs * 4 / totalCalories) * 100),
        fat: Math.round((nutrition.fat * 9 / totalCalories) * 100),
    }
}
