'use client'

import { cn } from '@/lib/utils'

interface TabSwitcherProps {
    activeTab: 'ingredients' | 'instructions'
    onTabChange: (tab: 'ingredients' | 'instructions') => void
    ingredientCount?: number
    stepCount?: number
    className?: string
}

export function TabSwitcher({
    activeTab,
    onTabChange,
    ingredientCount,
    stepCount,
    className,
}: TabSwitcherProps) {
    return (
        <div className={cn('flex rounded-xl bg-muted p-1', className)} data-testid="tab-switcher">
            <button
                onClick={() => onTabChange('ingredients')}
                className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                    activeTab === 'ingredients'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                )}
                data-testid="tab-ingredients"
            >
                🥗 Nguyên liệu {ingredientCount !== undefined && `(${ingredientCount})`}
            </button>
            <button
                onClick={() => onTabChange('instructions')}
                className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                    activeTab === 'instructions'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                )}
                data-testid="tab-instructions"
            >
                📝 Hướng dẫn {stepCount !== undefined && `(${stepCount})`}
            </button>
        </div>
    )
}
