'use client'

import { useState, useCallback, useTransition } from 'react'
import { SearchBar } from '@/components/recipes/search-bar'
import { TagList } from '@/components/recipes/tag-list'
import { RecipeGrid, RecipeGridSkeleton } from '@/components/recipes/recipe-grid'
import { FilterModal, type FilterValues } from '@/components/recipes/filter-modal'
import { Button } from '@/components/ui/button'
import { searchRecipes } from '@/lib/actions/recipes'
import type { RecipeCardData, TagData, RecipeSearchResult } from '@/lib/validations/recipe'

interface HomeClientProps {
    initialTrending: RecipeCardData[]
    tags: TagData[]
}

export function HomeClient({ initialTrending, tags }: HomeClientProps) {
    const [isPending, startTransition] = useTransition()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [filters, setFilters] = useState<FilterValues>({})
    const [searchResult, setSearchResult] = useState<RecipeSearchResult | null>(null)
    const [isSearchMode, setIsSearchMode] = useState(false)

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined)

    const performSearch = useCallback(
        (query: string, tagSlug: string | null, filterVals: FilterValues, page = 1) => {
            const shouldSearch = query.trim() || tagSlug || Object.values(filterVals).some(v => v !== undefined)

            if (!shouldSearch) {
                setIsSearchMode(false)
                setSearchResult(null)
                return
            }

            setIsSearchMode(true)
            startTransition(async () => {
                const result = await searchRecipes({
                    query: query.trim() || undefined,
                    tagSlug: tagSlug || undefined,
                    maxCookingTime: filterVals.maxCookingTime,
                    maxCalories: filterVals.maxCalories,
                    minRating: filterVals.minRating,
                    difficulty: filterVals.difficulty,
                    page,
                    pageSize: 12,
                })
                if (result.success) {
                    if (page > 1 && searchResult) {
                        // Append for pagination
                        setSearchResult({
                            ...result.data,
                            recipes: [...searchResult.recipes, ...result.data.recipes],
                        })
                    } else {
                        setSearchResult(result.data)
                    }
                }
            })
        },
        [searchResult]
    )

    const handleSearch = useCallback(
        (query: string) => {
            setSearchQuery(query)
            performSearch(query, selectedTag, filters)
        },
        [selectedTag, filters, performSearch]
    )

    const handleTagSelect = useCallback(
        (slug: string | null) => {
            setSelectedTag(slug)
            performSearch(searchQuery, slug, filters)
        },
        [searchQuery, filters, performSearch]
    )

    const handleFilterApply = useCallback(
        (newFilters: FilterValues) => {
            setFilters(newFilters)
            performSearch(searchQuery, selectedTag, newFilters)
        },
        [searchQuery, selectedTag, performSearch]
    )

    const handleLoadMore = useCallback(() => {
        if (searchResult && searchResult.page < searchResult.totalPages) {
            performSearch(searchQuery, selectedTag, filters, searchResult.page + 1)
        }
    }, [searchResult, searchQuery, selectedTag, filters, performSearch])

    const displayRecipes = isSearchMode ? (searchResult?.recipes ?? []) : initialTrending
    const showLoadMore = isSearchMode && searchResult && searchResult.page < searchResult.totalPages

    return (
        <>
            {/* Search Bar */}
            <section className="mb-4" data-testid="search-section">
                <SearchBar
                    onSearch={handleSearch}
                    onFilterClick={() => setIsFilterOpen(true)}
                    hasActiveFilters={hasActiveFilters}
                    initialValue={searchQuery}
                />
            </section>

            {/* Tags */}
            <section className="mb-6" data-testid="categories-section">
                <TagList
                    tags={tags}
                    selectedSlug={selectedTag}
                    onTagSelect={handleTagSelect}
                />
            </section>

            {/* Results section */}
            <section data-testid={isSearchMode ? 'search-results' : 'trending-section'}>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {isSearchMode
                            ? searchResult
                                ? `Kết quả (${searchResult.total})`
                                : 'Đang tìm...'
                            : 'Công thức phổ biến 🔥'}
                    </h2>
                </div>

                {isPending ? (
                    <RecipeGridSkeleton count={6} />
                ) : (
                    <>
                        <RecipeGrid
                            recipes={displayRecipes}
                            emptyMessage={
                                isSearchMode
                                    ? 'Không tìm thấy công thức phù hợp. Thử thay đổi bộ lọc nhé!'
                                    : 'Chưa có công thức nào'
                            }
                        />

                        {/* Load More */}
                        {showLoadMore && (
                            <div className="mt-6 flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isPending}
                                    data-testid="load-more"
                                >
                                    Xem thêm ({searchResult!.total - searchResult!.recipes.length} còn lại)
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Filter Modal */}
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={handleFilterApply}
                initialValues={filters}
            />
        </>
    )
}
