'use client'

/**
 * T173-T180: Meal Planner page client component
 * Full meal planning with calendar, daily timeline, add recipe/note modals
 */

import * as React from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { useUser } from '@/hooks/use-user'
import { CalendarStrip } from './calendar-strip'
import { DailyTimeline } from './daily-timeline'
import { AddRecipeModal } from './add-recipe-modal'
import { QuickNoteModal } from './quick-note-modal'
import { DailySummary } from './daily-summary'
import { PlannerSkeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
    getMealPlan,
    addRecipeToMealPlan,
    addQuickNoteToMealPlan,
    removeMealPlanEntry,
    markMealAsCompleted,
} from '@/lib/actions/meal-plans'
import type { MealPlanEntryData, MealType, DailySummary as DailySummaryType } from '@/lib/validations/meal-plan'

export function PlannerClient() {
    const { isAuthenticated, isLoading: authLoading } = useUser()

    // Calendar state
    const [weekStart, setWeekStart] = React.useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    )
    const [selectedDate, setSelectedDate] = React.useState(new Date())
    const dates = React.useMemo(() =>
        Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    )

    // Meal plan data
    const [entries, setEntries] = React.useState<MealPlanEntryData[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Modal state
    const [addRecipeModal, setAddRecipeModal] = React.useState<{ open: boolean; mealType: MealType }>({
        open: false,
        mealType: 'breakfast',
    })
    const [quickNoteModal, setQuickNoteModal] = React.useState<{ open: boolean; mealType: MealType }>({
        open: false,
        mealType: 'breakfast',
    })

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd')
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')

    // Fetch meal plan data
    const fetchMealPlan = React.useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        const result = await getMealPlan(weekStartStr, weekEndStr)
        if (result.success) {
            setEntries(result.data)
        }
        setIsLoading(false)
    }, [isAuthenticated, weekStartStr, weekEndStr])

    React.useEffect(() => {
        if (!authLoading) {
            fetchMealPlan()
        }
    }, [authLoading, fetchMealPlan])

    // Filter entries for selected date
    const dayEntries = React.useMemo(
        () => entries.filter(e => e.meal_date === selectedDateStr),
        [entries, selectedDateStr]
    )

    // Calculate daily summary
    const dailySummary = React.useMemo<DailySummaryType | null>(() => {
        if (dayEntries.length === 0) return null
        let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0
        for (const entry of dayEntries) {
            if (entry.recipe) {
                const ratio = entry.servings / (entry.recipe.servings || 1)
                totalCalories += Math.round((entry.recipe.calories_per_serving ?? 0) * ratio)
                totalProtein += Math.round((entry.recipe.protein_grams ?? 0) * ratio)
                totalCarbs += Math.round((entry.recipe.carbs_grams ?? 0) * ratio)
                totalFat += Math.round((entry.recipe.fat_grams ?? 0) * ratio)
            }
        }
        return {
            date: selectedDateStr,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat,
            mealCount: dayEntries.length,
        }
    }, [dayEntries, selectedDateStr])

    // Handlers
    const handleWeekChange = (direction: 'prev' | 'next') => {
        setWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7))
    }

    const handleAddRecipe = async (recipeId: string, servings: number) => {
        const result = await addRecipeToMealPlan(
            recipeId,
            selectedDateStr,
            addRecipeModal.mealType,
            servings
        )
        if (result.success) {
            setEntries(prev => [...prev, result.data])
        }
    }

    const handleAddNote = async (note: string) => {
        const result = await addQuickNoteToMealPlan(
            note,
            selectedDateStr,
            quickNoteModal.mealType
        )
        if (result.success) {
            setEntries(prev => [...prev, result.data])
        }
    }

    const handleRemoveEntry = async (entryId: string) => {
        // Optimistic remove
        const prev = [...entries]
        setEntries(entries.filter(e => e.id !== entryId))

        const result = await removeMealPlanEntry(entryId)
        if (!result.success) {
            setEntries(prev) // Revert
        }
    }

    const handleToggleComplete = async (entryId: string, isCompleted: boolean) => {
        // Optimistic update
        setEntries(entries.map(e =>
            e.id === entryId ? { ...e, is_completed: isCompleted } : e
        ))

        const result = await markMealAsCompleted(entryId, isCompleted)
        if (!result.success) {
            setEntries(entries.map(e =>
                e.id === entryId ? { ...e, is_completed: !isCompleted } : e
            ))
        }
    }

    // Login prompt for unauthenticated users
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-6">
                <section className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-foreground xs:text-3xl">
                        Lập kế hoạch bữa ăn 🗓️
                    </h1>
                </section>
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="mb-4 text-5xl">🔒</span>
                        <h2 className="mb-2 text-lg font-semibold">Đăng nhập để lập kế hoạch</h2>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                            Bạn cần đăng nhập để lên kế hoạch bữa ăn hàng tuần.
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
            <section className="mb-6">
                <h1 className="mb-2 text-2xl font-bold text-foreground xs:text-3xl">
                    Lập kế hoạch bữa ăn 🗓️
                </h1>
                <p className="text-sm text-muted-foreground">
                    Lên thực đơn cho tuần này
                </p>
            </section>

            {/* T174: Calendar strip */}
            <CalendarStrip
                dates={dates}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onWeekChange={handleWeekChange}
                className="mb-6"
            />

            {/* T178: Daily nutritional summary */}
            <DailySummary summary={dailySummary} className="mb-4" />

            {/* T180: Loading state */}
            {isLoading ? (
                <PlannerSkeleton />
            ) : (
                /* T175-T177: Daily timeline with add/remove */
                <DailyTimeline
                    entries={dayEntries}
                    onAddRecipe={(mealType) => setAddRecipeModal({ open: true, mealType })}
                    onAddNote={(mealType) => setQuickNoteModal({ open: true, mealType })}
                    onRemoveEntry={handleRemoveEntry}
                    onToggleComplete={handleToggleComplete}
                />
            )}

            {/* T175: Add recipe modal */}
            <AddRecipeModal
                isOpen={addRecipeModal.open}
                onClose={() => setAddRecipeModal(prev => ({ ...prev, open: false }))}
                onSelect={handleAddRecipe}
                mealType={addRecipeModal.mealType}
            />

            {/* T176: Quick note modal */}
            <QuickNoteModal
                isOpen={quickNoteModal.open}
                onClose={() => setQuickNoteModal(prev => ({ ...prev, open: false }))}
                onSave={handleAddNote}
                mealType={quickNoteModal.mealType}
            />
        </div>
    )
}
