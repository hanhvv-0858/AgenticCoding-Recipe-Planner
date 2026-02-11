'use client'

import * as React from 'react'
import Link from 'next/link'
import { RecipeImage } from '@/components/recipes/recipe-image'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { getNextUpcomingMeal } from '@/lib/actions/meal-plans'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealPlanEntryData } from '@/lib/validations/meal-plan'

/**
 * T172: NextMealCard with real data from meal plans
 */
export function NextMealCard() {
    const { isAuthenticated, isLoading: authLoading } = useUser()
    const [meal, setMeal] = React.useState<MealPlanEntryData | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (authLoading) return
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }
        async function fetch() {
            const result = await getNextUpcomingMeal()
            if (result.success) {
                setMeal(result.data)
            }
            setIsLoading(false)
        }
        fetch()
    }, [isAuthenticated, authLoading])

    if (isLoading) {
        return (
            <Card className="animate-pulse border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10" data-testid="next-meal-card">
                <CardContent className="flex items-center gap-3 p-3">
                    <div className="size-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-16 rounded bg-muted" />
                        <div className="h-4 w-32 rounded bg-muted" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!meal) {
        return (
            <Link href="/planner">
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 transition-all hover:shadow-md" data-testid="next-meal-card">
                    <CardContent className="flex items-center gap-3 p-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg">
                            🍽️
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Bữa tiếp theo</p>
                            <p className="text-sm font-semibold text-foreground">Chưa có kế hoạch</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Lên kế hoạch →</span>
                    </CardContent>
                </Card>
            </Link>
        )
    }

    const mealName = meal.recipe?.name ?? meal.quick_note ?? 'Bữa ăn'
    const mealIcon = MEAL_TYPE_ICONS[meal.meal_type]
    const mealLabel = MEAL_TYPE_LABELS[meal.meal_type]

    return (
        <Link href={meal.recipe ? `/recipes/${meal.recipe.id}` : '/planner'}>
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 transition-all hover:shadow-md" data-testid="next-meal-card">
                <CardContent className="flex items-center gap-3 p-3">
                    {meal.recipe ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                            <RecipeImage
                                src={meal.recipe.cover_image_url}
                                alt={mealName}
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        </div>
                    ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg">
                            {mealIcon}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            {mealLabel}
                        </p>
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                            {mealName}
                        </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">Xem →</span>
                </CardContent>
            </Card>
        </Link>
    )
}
