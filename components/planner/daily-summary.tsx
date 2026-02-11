'use client'

/**
 * T171: DailySummary - nutritional summary tooltip for a day
 */

import { cn } from '@/lib/utils'
import type { DailySummary as DailySummaryType } from '@/lib/validations/meal-plan'

interface DailySummaryProps {
    summary: DailySummaryType | null
    className?: string
}

export function DailySummary({ summary, className }: DailySummaryProps) {
    if (!summary || summary.mealCount === 0) {
        return null
    }

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3',
                className
            )}
            data-testid="daily-summary"
        >
            <div className="text-sm font-medium text-foreground">
                📊 Tổng quan ngày
            </div>
            <div className="flex flex-1 items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                        {summary.totalCalories}
                    </span>
                    <span>kcal</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                        {summary.totalProtein}g
                    </span>
                    <span>protein</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-green-600 dark:text-green-400">
                        {summary.totalCarbs}g
                    </span>
                    <span>carbs</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">
                        {summary.totalFat}g
                    </span>
                    <span>fat</span>
                </div>
            </div>
        </div>
    )
}
