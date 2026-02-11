'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RecipeImage } from '@/components/recipes/recipe-image'
import type { RecipeCardData } from '@/lib/validations/recipe'

interface RecipeCardProps {
    recipe: RecipeCardData
    className?: string
}

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

function getDifficultyColor(level: string | null): string {
    switch (level) {
        case 'easy': return 'text-green-600 dark:text-green-400'
        case 'medium': return 'text-yellow-600 dark:text-yellow-400'
        case 'hard': return 'text-red-600 dark:text-red-400'
        default: return ''
    }
}

export function RecipeCard({ recipe, className }: RecipeCardProps) {
    const router = useRouter()

    /** T237: Prefetch recipe detail page on hover/focus for faster navigation */
    const handlePrefetch = useCallback(() => {
        router.prefetch(`/recipes/${recipe.id}`)
    }, [router, recipe.id])

    return (
        <Link
            href={`/recipes/${recipe.id}`}
            className={cn(
                'group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md active:scale-[0.98]',
                className
            )}
            data-testid="recipe-card"
            onMouseEnter={handlePrefetch}
            onFocus={handlePrefetch}
        >
            {/* Cover Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <RecipeImage
                    src={recipe.cover_image_url}
                    alt={recipe.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Rating badge */}
                {recipe.rating && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <svg className="size-3 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{recipe.rating.toFixed(1)}</span>
                    </div>
                )}
                {/* Cooking time badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(recipe.cooking_time_minutes)}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-foreground">
                    {recipe.name}
                </h3>

                {recipe.description && (
                    <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                        {recipe.description}
                    </p>
                )}

                {/* Quick info row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {recipe.calories_per_serving && (
                        <span className="flex items-center gap-1">
                            🔥 {recipe.calories_per_serving} cal
                        </span>
                    )}
                    {recipe.difficulty_level && (
                        <span className={cn('font-medium', getDifficultyColor(recipe.difficulty_level))}>
                            {getDifficultyLabel(recipe.difficulty_level)}
                        </span>
                    )}
                </div>

                {/* Tags */}
                {recipe.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map(tag => (
                            <Badge
                                key={tag.slug}
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px]"
                            >
                                {tag.icon_emoji} {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    )
}

/**
 * Skeleton for loading state
 */
export function RecipeCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" data-testid="recipe-card-skeleton">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="p-3">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-2 h-3 w-full" />
                <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>
        </div>
    )
}
