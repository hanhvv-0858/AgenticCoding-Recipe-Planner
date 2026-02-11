import { createClient } from '@/lib/supabase/server'
import type {
    RecipeSearchParams,
    RecipeCardData,
    RecipeSearchResult,
    TagData,
    RecipeDetailData,
    RecipeIngredientData,
    RecipeStepData,
} from '@/lib/validations/recipe'

type RecipeRow = {
    id: string
    name: string
    description: string | null
    cover_image_url: string
    cooking_time_minutes: number
    prep_time_minutes: number | null
    servings: number
    calories_per_serving: number | null
    difficulty_level: 'easy' | 'medium' | 'hard' | null
    rating: number | null
    rating_count: number
}

const RECIPE_SELECT = 'id, name, description, cover_image_url, cooking_time_minutes, prep_time_minutes, servings, calories_per_serving, difficulty_level, rating, rating_count' as const

/**
 * T087: Get trending recipes (highest rated, public)
 */
export async function getTrendingRecipes(limit = 6): Promise<RecipeCardData[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('recipes')
        .select(RECIPE_SELECT)
        .eq('is_public', true)
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .order('rating_count', { ascending: false })
        .limit(limit)

    if (error) throw error

    const recipes = (data ?? []) as unknown as RecipeRow[]
    if (recipes.length === 0) return []

    const recipeIds = recipes.map(r => r.id)
    return attachTagsToRecipes(supabase, recipes, recipeIds)
}

/**
 * T088: Search recipes with filters
 */
export async function searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResult> {
    const supabase = await createClient()

    // Tag filter - need IDs first
    let tagRecipeIds: string[] | null = null
    if (params.tagSlug) {
        const { data: tagData } = (await supabase
            .from('recipe_tags')
            .select('id')
            .eq('slug', params.tagSlug)
            .single()) as unknown as { data: { id: string } | null }

        if (tagData) {
            const { data: mappings } = (await supabase
                .from('recipe_tag_mappings')
                .select('recipe_id')
                .eq('tag_id', tagData.id)) as unknown as { data: { recipe_id: string }[] | null }

            if (mappings && mappings.length > 0) {
                tagRecipeIds = mappings.map(m => m.recipe_id)
            } else {
                return { recipes: [], total: 0, page: params.page, pageSize: params.pageSize, totalPages: 0 }
            }
        }
    }

    // eslint-disable-next-line
    let query: any = supabase
        .from('recipes')
        .select(RECIPE_SELECT, { count: 'exact' })
        .eq('is_public', true)

    if (params.query && params.query.trim()) {
        // Escape PostgREST special characters to prevent filter injection
        const escaped = params.query.replace(/[%_.,()\\]/g, (c) => `\\${c}`)
        query = query.or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    }
    if (params.maxCookingTime) {
        query = query.lte('cooking_time_minutes', params.maxCookingTime)
    }
    if (params.maxCalories) {
        query = query.lte('calories_per_serving', params.maxCalories)
    }
    if (params.minRating) {
        query = query.gte('rating', params.minRating)
    }
    if (params.difficulty) {
        query = query.eq('difficulty_level', params.difficulty)
    }
    if (tagRecipeIds) {
        query = query.in('id', tagRecipeIds)
    }

    // Sorting
    const ascending = params.sortOrder === 'asc'
    query = query.order(params.sortBy, { ascending, nullsFirst: false })

    // Pagination
    const from = (params.page - 1) * params.pageSize
    const to = from + params.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    const recipes = (data ?? []) as unknown as RecipeRow[]
    const total = count ?? 0
    const recipeIds = recipes.map(r => r.id)
    const recipesWithTags = await attachTagsToRecipes(supabase, recipes, recipeIds)

    return {
        recipes: recipesWithTags,
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
    }
}

/**
 * T089: Get recipes by tag slug
 */
export async function getRecipesByTag(
    tagSlug: string,
    page = 1,
    pageSize = 12
): Promise<RecipeSearchResult> {
    return searchRecipes({
        tagSlug,
        page,
        pageSize,
        sortBy: 'rating',
        sortOrder: 'desc',
    })
}

/**
 * T090: Get all recipe tags
 */
export async function getAllTags(): Promise<TagData[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('recipe_tags')
        .select('id, name, slug, icon_emoji, display_order')
        .order('display_order', { ascending: true })

    if (error) throw error
    return (data ?? []) as TagData[]
}

/**
 * T113: Get recipe detail with ingredients and steps
 */
export async function getRecipeDetail(recipeId: string): Promise<RecipeDetailData | null> {
    const supabase = await createClient()

    // Fetch recipe
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select('id, name, description, cover_image_url, cooking_time_minutes, prep_time_minutes, servings, calories_per_serving, protein_grams, carbs_grams, fat_grams, difficulty_level, rating, rating_count, is_public, created_by')
        .eq('id', recipeId)
        .single()

    if (error || !recipe) return null

    const recipeData = recipe as unknown as {
        id: string; name: string; description: string | null; cover_image_url: string
        cooking_time_minutes: number; prep_time_minutes: number | null; servings: number
        calories_per_serving: number | null; protein_grams: number | null
        carbs_grams: number | null; fat_grams: number | null
        difficulty_level: 'easy' | 'medium' | 'hard' | null
        rating: number | null; rating_count: number; is_public: boolean; created_by: string | null
    }

    // Fetch ingredients with ingredient names
    const { data: rawIngredients } = await supabase
        .from('recipe_ingredients')
        .select('id, ingredient_id, quantity, unit, preparation_note, is_optional, display_order')
        .eq('recipe_id', recipeId)
        .order('display_order', { ascending: true })

    const ingredientRows = (rawIngredients ?? []) as unknown as {
        id: string; ingredient_id: string; quantity: number; unit: string
        preparation_note: string | null; is_optional: boolean; display_order: number
    }[]

    // Fetch ingredient details
    const ingredientIds = ingredientRows.map(i => i.ingredient_id)
    let ingredientMap: Record<string, { name: string; icon_emoji: string | null; category: string }> = {}
    if (ingredientIds.length > 0) {
        const { data: rawIngDetails } = await supabase
            .from('ingredients')
            .select('id, name, icon_emoji, category')
            .in('id', ingredientIds)

        const ingDetails = (rawIngDetails ?? []) as unknown as {
            id: string; name: string; icon_emoji: string | null; category: string
        }[]
        ingredientMap = Object.fromEntries(ingDetails.map(i => [i.id, { name: i.name, icon_emoji: i.icon_emoji, category: i.category }]))
    }

    const ingredients: RecipeIngredientData[] = ingredientRows.map(row => ({
        ...row,
        ingredient_name: ingredientMap[row.ingredient_id]?.name ?? 'Unknown',
        icon_emoji: ingredientMap[row.ingredient_id]?.icon_emoji ?? null,
        category: ingredientMap[row.ingredient_id]?.category ?? 'other',
    }))

    // Fetch steps
    const { data: rawSteps } = await supabase
        .from('recipe_steps')
        .select('id, step_number, instruction, image_url, duration_minutes')
        .eq('recipe_id', recipeId)
        .order('step_number', { ascending: true })

    const steps = (rawSteps ?? []) as unknown as RecipeStepData[]

    // Fetch tags
    const recipeIds = [recipeId]
    const tagsResult = await attachTagsToRecipes(supabase, [recipeData as unknown as RecipeRow], recipeIds)
    const tags = tagsResult[0]?.tags ?? []

    return {
        ...recipeData,
        tags,
        ingredients,
        steps,
    }
}

// Helper: Attach tags to recipe cards
async function attachTagsToRecipes(
    supabase: Awaited<ReturnType<typeof createClient>>,
    recipes: RecipeRow[],
    recipeIds: string[]
): Promise<RecipeCardData[]> {
    if (recipeIds.length === 0) return []

    // Fetch tag mappings
    const { data: rawMappings } = await supabase
        .from('recipe_tag_mappings')
        .select('recipe_id, tag_id')
        .in('recipe_id', recipeIds)

    const tagMappings = (rawMappings ?? []) as unknown as { recipe_id: string; tag_id: string }[]

    // Fetch actual tag data
    const tagIds = [...new Set(tagMappings.map(m => m.tag_id))]
    let tagsMap: Record<string, { name: string; slug: string; icon_emoji: string | null }> = {}

    if (tagIds.length > 0) {
        const { data: rawTags } = await supabase
            .from('recipe_tags')
            .select('id, name, slug, icon_emoji')
            .in('id', tagIds)

        const tags = (rawTags ?? []) as unknown as { id: string; name: string; slug: string; icon_emoji: string | null }[]
        tagsMap = Object.fromEntries(tags.map(t => [t.id, { name: t.name, slug: t.slug, icon_emoji: t.icon_emoji }]))
    }

    // Map recipe_id → tags
    const recipeTagsMap: Record<string, { name: string; slug: string; icon_emoji: string | null }[]> = {}
    for (const mapping of tagMappings) {
        if (!recipeTagsMap[mapping.recipe_id]) {
            recipeTagsMap[mapping.recipe_id] = []
        }
        const tag = tagsMap[mapping.tag_id]
        if (tag) {
            recipeTagsMap[mapping.recipe_id].push(tag)
        }
    }

    return recipes.map(recipe => ({
        ...recipe,
        tags: recipeTagsMap[recipe.id] ?? [],
    }))
}
