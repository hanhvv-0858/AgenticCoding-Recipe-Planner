'use client'

/**
 * T145, T146, T147: Cookbook page client component
 * Displays saved recipes grid with empty state and optimistic updates
 */

import * as React from 'react'
import Link from 'next/link'
import { RecipeImage } from '@/components/recipes/recipe-image'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { CookbookSkeleton } from '@/components/ui/skeleton'
import { useUser } from '@/hooks/use-user'
import { getSavedRecipes, unsaveRecipe } from '@/lib/actions/cookbook'
import type { SavedRecipeData } from '@/lib/validations/cookbook'

function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} phút`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}p` : `${hours}h`
}

function getDifficultyLabel(level: string | null): string {
    switch (level) {
        case 'easy': return 'Dễ'
        case 'medium': return 'Trung bình'
        case 'hard': return 'Khó'
        default: return ''
    }
}

export function CookbookClient() {
    const { isAuthenticated, isLoading: authLoading } = useUser()
    const [recipes, setRecipes] = React.useState<SavedRecipeData[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [total, setTotal] = React.useState(0)
    const [removingId, setRemovingId] = React.useState<string | null>(null)

    const fetchRecipes = React.useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        const result = await getSavedRecipes(1, 50)
        if (result.success) {
            setRecipes(result.data.recipes)
            setTotal(result.data.total)
        }
        setIsLoading(false)
    }, [isAuthenticated])

    React.useEffect(() => {
        if (!authLoading) {
            fetchRecipes()
        }
    }, [authLoading, fetchRecipes])

    const handleRemove = async (recipeId: string) => {
        setRemovingId(recipeId)
        // Optimistic: remove from list immediately
        const previousRecipes = [...recipes]
        setRecipes(prev => prev.filter(r => r.recipe_id !== recipeId))
        setTotal(prev => prev - 1)

        const result = await unsaveRecipe(recipeId)
        if (!result.success) {
            // Revert on failure
            setRecipes(previousRecipes)
            setTotal(prev => prev + 1)
        }
        setRemovingId(null)
    }

    // Show login prompt for unauthenticated users
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-6">
                <section className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-foreground xs:text-3xl">
                        Sổ tay công thức 📖
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Các món ăn đã lưu của bạn
                    </p>
                </section>
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="mb-4 text-5xl">🔒</span>
                        <h2 className="mb-2 text-lg font-semibold text-foreground">
                            Đăng nhập để xem sổ tay
                        </h2>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                            Bạn cần đăng nhập để lưu và xem các công thức yêu thích.
                        </p>
                        <Link
                            href="/login"
                            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Đăng nhập
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <section className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-foreground xs:text-3xl">
                    Sổ tay công thức 📖
                </h1>
                <p className="text-sm text-muted-foreground">
                    {total > 0 ? `${total} công thức đã lưu` : 'Các món ăn đã lưu của bạn'}
                </p>
            </section>

            <section data-testid="cookbook-content">
                {isLoading ? (
                    <CookbookSkeleton />
                ) : recipes.length === 0 ? (
                    /* T146: Empty state */
                    <Card className="border-dashed" data-testid="cookbook-empty">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="mb-4 text-5xl">📖</span>
                            <h2 className="mb-2 text-lg font-semibold text-foreground">
                                Chưa có công thức nào
                            </h2>
                            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                Lưu các công thức yêu thích từ trang Khám phá để xem lại ở đây
                                bất cứ lúc nào.
                            </p>
                            <Link
                                href="/"
                                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Khám phá công thức
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    /* Saved recipes grid */
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="cookbook-grid">
                        {recipes.map(({ recipe_id, recipe }) => (
                            <div
                                key={recipe_id}
                                className={cn(
                                    'group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md',
                                    removingId === recipe_id && 'scale-95 opacity-50'
                                )}
                                data-testid={`saved-recipe-${recipe_id}`}
                            >
                                <Link href={`/recipes/${recipe.id}`}>
                                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                        <RecipeImage
                                            src={recipe.cover_image_url}
                                            alt={recipe.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                        {recipe.rating && (
                                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                ⭐ {recipe.rating.toFixed(1)}
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                            🕐 {formatTime(recipe.cooking_time_minutes)}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-foreground">
                                            {recipe.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {recipe.calories_per_serving && (
                                                <span>{recipe.calories_per_serving} kcal</span>
                                            )}
                                            {recipe.difficulty_level && (
                                                <span>{getDifficultyLabel(recipe.difficulty_level)}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                {/* Remove saved button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleRemove(recipe_id)
                                    }}
                                    disabled={removingId === recipe_id}
                                    className="absolute right-2 top-2 z-10 hidden rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-red-500 group-hover:block"
                                    data-testid={`remove-saved-${recipe_id}`}
                                    title="Bỏ lưu công thức"
                                >
                                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
