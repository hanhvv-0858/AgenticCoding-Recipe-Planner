import { cn } from '@/lib/utils'

/**
 * Skeleton primitive component for loading states.
 * Uses TailwindCSS animate-pulse to create a pulsing placeholder effect.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />              // Text line
 *   <Skeleton className="h-12 w-12 rounded-full" /> // Avatar
 *   <Skeleton className="aspect-[4/3] w-full" />    // Image placeholder
 */
export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded bg-muted', className)}
            {...props}
        />
    )
}

/**
 * Composes multiple Skeleton elements in a vertical stack.
 */
export function SkeletonGroup({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('space-y-3', className)} {...props}>
            {children}
        </div>
    )
}

// ─── Page-Level Skeleton Layouts ─────────────────────────────────────

/**
 * Home page skeleton — hero heading + next meal card + tag strip + recipe grid
 */
export function HomePageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6" data-testid="home-skeleton">
            {/* Heading */}
            <div className="mb-4">
                <Skeleton className="mb-2 h-8 w-56" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Next meal card */}
            <Skeleton className="mb-4 h-24 w-full rounded-xl" />

            {/* Search bar */}
            <Skeleton className="mb-4 h-10 w-full rounded-lg" />

            {/* Tag strip */}
            <div className="mb-4 flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 flex-shrink-0 rounded-full" />
                ))}
            </div>

            {/* Recipe grid */}
            <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                        <Skeleton className="aspect-[4/3] rounded-none" />
                        <div className="space-y-2 p-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Recipe detail page skeleton — parallax image + tabs + ingredients
 */
export function RecipeDetailSkeleton() {
    return (
        <div data-testid="recipe-detail-skeleton">
            {/* Hero image */}
            <Skeleton className="h-56 w-full rounded-none sm:h-72 md:h-80" />

            {/* Content */}
            <div className="container mx-auto px-4 py-4">
                {/* Title + rating */}
                <Skeleton className="mb-2 h-7 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />

                {/* Quick info row */}
                <div className="mb-4 flex gap-4">
                    <Skeleton className="h-12 w-20 rounded-lg" />
                    <Skeleton className="h-12 w-20 rounded-lg" />
                    <Skeleton className="h-12 w-20 rounded-lg" />
                </div>

                {/* Servings selector */}
                <div className="mb-4 flex items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-9 w-28 rounded-lg" />
                </div>

                {/* Tab switcher */}
                <div className="mb-4 flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>

                {/* Ingredient list */}
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>

                {/* Action button */}
                <Skeleton className="mt-6 h-12 w-full rounded-xl" />
            </div>
        </div>
    )
}

/**
 * Cookbook page skeleton — heading + recipe grid
 */
export function CookbookSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6" data-testid="cookbook-skeleton">
            {/* Heading */}
            <div className="mb-8">
                <Skeleton className="mb-2 h-8 w-52" />
                <Skeleton className="h-4 w-40" />
            </div>

            {/* Recipe grid */}
            <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                        <Skeleton className="aspect-[4/3] rounded-none" />
                        <div className="space-y-2 p-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Planner page skeleton — calendar strip + daily summary + meal blocks
 */
export function PlannerSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6" data-testid="planner-skeleton">
            {/* Heading */}
            <div className="mb-4">
                <Skeleton className="mb-2 h-8 w-48" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Calendar strip */}
            <div className="mb-6 flex gap-2 overflow-hidden">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-shrink-0 flex-col items-center gap-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                ))}
            </div>

            {/* Daily summary */}
            <Skeleton className="mb-4 h-16 w-full rounded-xl" />

            {/* Meal blocks */}
            <div className="space-y-4">
                {['Sáng', 'Trưa', 'Tối'].map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4">
                        <Skeleton className="mb-3 h-5 w-24" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Grocery list page skeleton — heading + action bar + category groups
 */
export function GrocerySkeleton() {
    return (
        <div className="container mx-auto px-4 py-6" data-testid="grocery-skeleton">
            {/* Heading */}
            <div className="mb-4">
                <Skeleton className="mb-2 h-8 w-56" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Action bar: generate + add */}
            <div className="mb-4 flex gap-2">
                <Skeleton className="h-9 w-36 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
            </div>

            {/* Progress bar */}
            <Skeleton className="mb-4 h-2 w-full rounded-full" />

            {/* Category groups */}
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i}>
                        <div className="mb-2 flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                                <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                                <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Profile page skeleton — heading + avatar area + form fields
 */
export function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6" data-testid="profile-skeleton">
            {/* Heading */}
            <Skeleton className="mb-6 h-8 w-40" />

            {/* Avatar / user info card */}
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            {/* Settings card */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    )
}
