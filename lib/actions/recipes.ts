'use server'

import {
    recipeSearchSchema,
    type RecipeSearchParams,
    type RecipeSearchResult,
    type RecipeCardData,
    type TagData,
    type RecipeDetailData,
} from '@/lib/validations/recipe'
import {
    getTrendingRecipes as queryTrending,
    searchRecipes as querySearch,
    getRecipesByTag as queryByTag,
    getAllTags as queryAllTags,
    getRecipeDetail as queryRecipeDetail,
} from '@/lib/queries/recipes'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * T091: Search recipes server action
 */
export async function searchRecipes(
    params: Partial<RecipeSearchParams>
): Promise<ActionResult<RecipeSearchResult>> {
    try {
        const validated = recipeSearchSchema.parse({
            query: params.query,
            tagSlug: params.tagSlug,
            maxCookingTime: params.maxCookingTime,
            maxCalories: params.maxCalories,
            minRating: params.minRating,
            difficulty: params.difficulty,
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 12,
            sortBy: params.sortBy ?? 'rating',
            sortOrder: params.sortOrder ?? 'desc',
        })

        const result = await querySearch(validated)
        return { success: true, data: result }
    } catch (error) {
        console.error('searchRecipes error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tìm kiếm công thức',
        }
    }
}

/**
 * T092: Get trending recipes server action
 */
export async function getTrendingRecipes(
    limit = 6
): Promise<ActionResult<RecipeCardData[]>> {
    try {
        const data = await queryTrending(limit)
        return { success: true, data }
    } catch (error) {
        console.error('getTrendingRecipes error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải công thức phổ biến',
        }
    }
}

/**
 * T093: Get recipes by tag server action
 */
export async function getRecipesByTag(
    tagSlug: string,
    page = 1,
    pageSize = 12
): Promise<ActionResult<RecipeSearchResult>> {
    try {
        if (!tagSlug || !tagSlug.trim()) {
            return { success: false, error: 'Tag không hợp lệ' }
        }
        const data = await queryByTag(tagSlug, page, pageSize)
        return { success: true, data }
    } catch (error) {
        console.error('getRecipesByTag error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải công thức theo danh mục',
        }
    }
}

/**
 * T094: Get all recipe tags server action
 */
export async function getRecipeTags(): Promise<ActionResult<TagData[]>> {
    try {
        const data = await queryAllTags()
        return { success: true, data }
    } catch (error) {
        console.error('getRecipeTags error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải danh mục',
        }
    }
}

/**
 * T115: Get recipe detail server action
 */
export async function getRecipeDetail(
    recipeId: string
): Promise<ActionResult<RecipeDetailData>> {
    try {
        if (!recipeId || !recipeId.trim()) {
            return { success: false, error: 'ID công thức không hợp lệ' }
        }
        const data = await queryRecipeDetail(recipeId)
        if (!data) {
            return { success: false, error: 'Không tìm thấy công thức' }
        }
        return { success: true, data }
    } catch (error) {
        console.error('getRecipeDetail error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Không thể tải chi tiết công thức',
        }
    }
}
