'use client'

/**
 * T166: CalendarStrip - horizontal scrolling date selector
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { format, isToday } from 'date-fns'

interface CalendarStripProps {
    dates: Date[]
    selectedDate: Date
    onDateSelect: (date: Date) => void
    onWeekChange: (direction: 'prev' | 'next') => void
    className?: string
}

const SHORT_DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function CalendarStrip({
    dates,
    selectedDate,
    onDateSelect,
    onWeekChange,
    className,
}: CalendarStripProps) {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

    return (
        <div className={cn('space-y-3', className)} data-testid="calendar-strip">
            {/* Week navigation */}
            <div className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm" data-testid="week-selector">
                <button
                    onClick={() => onWeekChange('prev')}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                    data-testid="week-prev"
                >
                    ←
                </button>
                <span className="text-sm font-medium">
                    {format(dates[0], 'dd/MM')} - {format(dates[dates.length - 1], 'dd/MM')}
                </span>
                <button
                    onClick={() => onWeekChange('next')}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                    data-testid="week-next"
                >
                    →
                </button>
            </div>

            {/* Day pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="day-strip">
                {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isSelected = dateStr === selectedDateStr
                    const today = isToday(date)
                    const dayOfWeek = date.getDay()

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(date)}
                            className={cn(
                                'flex min-w-[48px] flex-col items-center rounded-xl px-3 py-2 text-sm transition-all',
                                isSelected
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : today
                                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                        : 'bg-card text-muted-foreground hover:bg-accent'
                            )}
                            data-testid={`day-${dateStr}`}
                        >
                            <span className="text-xs font-medium">
                                {SHORT_DAY_NAMES[dayOfWeek]}
                            </span>
                            <span className="text-lg font-bold">
                                {format(date, 'd')}
                            </span>
                            {today && !isSelected && (
                                <div className="mt-0.5 size-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
