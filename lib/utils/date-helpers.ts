/**
 * Date Helper Utilities
 * Utilities for working with dates in meal planning
 */

import {
    format,
    formatDistance,
    formatRelative,
    isToday,
    isTomorrow,
    isYesterday,
    isThisWeek,
    startOfWeek,
    endOfWeek,
    addDays,
    differenceInDays,
    parseISO,
} from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format date for display in Vietnamese
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: vi })
}

/**
 * Get relative time string (e.g., "2 giờ trước", "hôm qua")
 */
export function getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date

    if (isToday(dateObj)) {
        return 'Hôm nay'
    }

    if (isTomorrow(dateObj)) {
        return 'Ngày mai'
    }

    if (isYesterday(dateObj)) {
        return 'Hôm qua'
    }

    return formatRelative(dateObj, new Date(), { locale: vi })
}

/**
 * Get time ago string (e.g., "2 giờ trước")
 */
export function getTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: vi })
}

/**
 * Get date range for current week
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
    const now = new Date()
    return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
    }
}

/**
 * Get date range for next week
 */
export function getNextWeekRange(): { start: Date; end: Date } {
    const { start } = getCurrentWeekRange()
    const nextWeekStart = addDays(start, 7)
    return {
        start: nextWeekStart,
        end: addDays(nextWeekStart, 6),
    }
}

/**
 * Get array of dates for a week
 */
export function getWeekDates(startDate: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
}

/**
 * Format date for meal plan display
 */
export function formatMealPlanDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date

    if (isToday(dateObj)) {
        return 'Hôm nay - ' + format(dateObj, 'dd/MM')
    }

    if (isTomorrow(dateObj)) {
        return 'Ngày mai - ' + format(dateObj, 'dd/MM')
    }

    if (isThisWeek(dateObj, { weekStartsOn: 1 })) {
        return format(dateObj, 'EEEE - dd/MM', { locale: vi })
    }

    return format(dateObj, 'dd/MM/yyyy', { locale: vi })
}

/**
 * Get day name in Vietnamese
 */
export function getDayName(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'EEEE', { locale: vi })
}

/**
 * Check if date is within meal plan range
 */
export function isInMealPlanRange(
    date: Date | string,
    startDate: Date | string,
    endDate: Date | string
): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate

    return dateObj >= startObj && dateObj <= endObj
}

/**
 * Format date for database (ISO string)
 */
export function formatForDatabase(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * Get days until date
 */
export function getDaysUntil(date: Date | string): number {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return differenceInDays(dateObj, new Date())
}
