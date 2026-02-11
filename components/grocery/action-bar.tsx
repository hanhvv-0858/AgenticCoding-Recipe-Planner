'use client'

/**
 * ActionBar Component (T212)
 * Top action bar with generate, add, clear, and share buttons
 */

import { cn } from '@/lib/utils'

interface ActionBarProps {
    totalItems: number
    checkedItems: number
    uncheckedItems: number
    onGenerate: () => void
    onAddCustom: () => void
    onClearCompleted: () => void
    onShare: () => void
    isGenerating?: boolean
}

export function ActionBar({
    totalItems,
    checkedItems,
    uncheckedItems,
    onGenerate,
    onAddCustom,
    onClearCompleted,
    onShare,
    isGenerating,
}: ActionBarProps) {
    return (
        <div data-testid="grocery-action-bar" className="space-y-3">
            {/* Stats */}
            {totalItems > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{uncheckedItems} cần mua</span>
                    <span>·</span>
                    <span>{checkedItems} đã mua</span>
                    <span>·</span>
                    <span>{totalItems} tổng</span>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={cn(
                        'flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90',
                        isGenerating && 'opacity-50'
                    )}
                    data-testid="generate-grocery-list"
                >
                    {isGenerating ? '⏳' : '🔄'} Tạo từ kế hoạch
                </button>

                <button
                    onClick={onAddCustom}
                    className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    data-testid="add-custom-item"
                >
                    ➕ Thêm
                </button>

                {checkedItems > 0 && (
                    <button
                        onClick={onClearCompleted}
                        className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        data-testid="clear-completed"
                    >
                        🧹 Xoá đã mua ({checkedItems})
                    </button>
                )}

                {totalItems > 0 && (
                    <button
                        onClick={onShare}
                        className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        data-testid="share-grocery-list"
                    >
                        📤 Chia sẻ
                    </button>
                )}
            </div>
        </div>
    )
}
