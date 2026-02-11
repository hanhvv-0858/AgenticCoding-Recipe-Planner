'use client'

/**
 * GroceryListItem Component (T208)
 * Individual grocery item with checkbox, name, quantity, and actions
 */

import { cn } from '@/lib/utils'
import type { GroceryListItemData } from '@/lib/validations/grocery-list'

interface GroceryListItemProps {
    item: GroceryListItemData
    onToggle: (itemId: string, isChecked: boolean) => void
    onRemove: (itemId: string) => void
    isToggling?: boolean
}

export function GroceryListItem({ item, onToggle, onRemove, isToggling }: GroceryListItemProps) {
    return (
        <div
            className={cn(
                'group flex items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2.5 transition-all',
                item.is_checked && 'border-border/30 bg-muted/30 opacity-60'
            )}
            data-testid={`grocery-item-${item.id}`}
        >
            {/* Checkbox */}
            <button
                onClick={() => onToggle(item.id, !item.is_checked)}
                disabled={isToggling}
                className={cn(
                    'flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
                data-testid={`grocery-check-${item.id}`}
                aria-label={item.is_checked ? 'Bỏ đánh dấu' : 'Đánh dấu đã mua'}
            >
                <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2',
                    item.is_checked
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground/40 hover:border-primary'
                )}>
                    {item.is_checked && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </span>
            </button>

            {/* Item info */}
            <div className="min-w-0 flex-1">
                {/* Dòng đầu: Tên + số lượng (gộp 1 dòng trên mobile) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {item.icon_emoji && (
                            <span className="text-sm">{item.icon_emoji}</span>
                        )}
                        <span className={cn(
                            'text-sm font-medium text-foreground truncate',
                            item.is_checked && 'line-through text-muted-foreground'
                        )}>
                            {item.item_name}
                        </span>
                        {/* Số lượng + đơn vị: gộp vào cùng dòng trên mobile */}
                        <span className="text-xs text-muted-foreground ml-1 sm:ml-0">
                            - {item.quantity} {item.unit}
                        </span>
                    </div>
                </div>
                {/* Dòng phụ: notes, món ăn... giữ nguyên */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.notes && (
                        <>
                            <span className="truncate">{item.notes}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Remove button */}
            <button
                onClick={() => onRemove(item.id)}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded text-muted-foreground opacity-100 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                data-testid={`grocery-remove-${item.id}`}
                aria-label={`Xoá ${item.item_name}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    )
}
