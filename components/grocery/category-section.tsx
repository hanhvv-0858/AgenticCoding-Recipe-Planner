'use client'

/**
 * CategorySection Component (T209)
 * Collapsible category group with item count
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { GroceryListGrouped } from '@/lib/validations/grocery-list'
import { GroceryListItem } from './grocery-list-item'

interface CategorySectionProps {
    group: GroceryListGrouped
    onToggleItem: (itemId: string, isChecked: boolean) => void
    onRemoveItem: (itemId: string) => void
    togglingIds?: Set<string>
}

export function CategorySection({ group, onToggleItem, onRemoveItem, togglingIds }: CategorySectionProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const uncheckedCount = group.items.filter(i => !i.is_checked).length
    const totalCount = group.items.length

    return (
        <div data-testid={`grocery-category-${group.category}`} className="mb-4">
            {/* Category header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 transition-colors hover:bg-muted"
                data-testid={`grocery-category-toggle-${group.category}`}
            >
                <span className="text-base">{group.icon}</span>
                <span className="flex-1 text-left text-sm font-semibold text-foreground">
                    {group.label}
                </span>
                <span className="text-xs text-muted-foreground">
                    {uncheckedCount === 0
                        ? `✓ ${totalCount}`
                        : `${uncheckedCount}/${totalCount}`
                    }
                </span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(
                        'shrink-0 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-180'
                    )}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Items */}
            {isExpanded && (
                <div className="mt-2 space-y-1.5 pl-1">
                    {group.items.map(item => (
                        <GroceryListItem
                            key={item.id}
                            item={item}
                            onToggle={onToggleItem}
                            onRemove={onRemoveItem}
                            isToggling={togglingIds?.has(item.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
