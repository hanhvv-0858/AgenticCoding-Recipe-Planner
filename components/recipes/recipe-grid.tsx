import { cn } from '@/lib/utils'
import { RecipeCard, RecipeCardSkeleton } from './recipe-card'
import type { RecipeCardData } from '@/lib/validations/recipe'

interface RecipeGridProps {
    recipes: RecipeCardData[]
    className?: string
    emptyMessage?: string
}

export function RecipeGrid({ recipes, className, emptyMessage = 'Không tìm thấy công thức nào' }: RecipeGridProps) {
    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="recipe-grid-empty">
                <div className="mb-3 text-4xl">🍳</div>
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div
            className={cn('grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3', className)}
            data-testid="recipe-grid"
        >
            {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
    )
}

interface RecipeGridSkeletonProps {
    count?: number
    className?: string
}

export function RecipeGridSkeleton({ count = 6, className }: RecipeGridSkeletonProps) {
    return (
        <div
            className={cn('grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3', className)}
            data-testid="recipe-grid-skeleton"
        >
            {Array.from({ length: count }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
            ))}
        </div>
    )
}
