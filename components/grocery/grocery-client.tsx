'use client'

/**
 * GroceryClient Component (T213-T221)
 * Main grocery list page orchestrator
 */

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/hooks/use-user'
import { CategorySection } from './category-section'
import { AddCustomItemModal } from './add-custom-item-modal'
import { ShareListModal } from './share-list-modal'
import { ActionBar } from './action-bar'
import {
    getGroceryList,
    generateGroceryList,
    toggleGroceryItemChecked,
    addCustomGroceryItem,
    deleteGroceryItem,
    clearCompletedGroceryItems,
    generateShareableGroceryList,
} from '@/lib/actions/grocery-lists'
import type { GroceryListGrouped, IngredientCategory } from '@/lib/validations/grocery-list'
import { getCurrentWeekRange } from '@/lib/utils/date-helpers'
import { formatForDatabase } from '@/lib/utils/date-helpers'
import { GrocerySkeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export function GroceryClient() {
    const { user, isLoading: authLoading } = useUser()
    const [groups, setGroups] = useState<GroceryListGrouped[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [checkedItems, setCheckedItems] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
    const [showAddModal, setShowAddModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [shareText, setShareText] = useState('')

    const fetchList = useCallback(async () => {
        const result = await getGroceryList()
        if (result.success) {
            setGroups(result.data.groups)
            setTotalItems(result.data.totalItems)
            setCheckedItems(result.data.checkedItems)
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (user) {
            fetchList()
        } else if (!authLoading) {
            setIsLoading(false)
        }
    }, [user, authLoading, fetchList])

    // T214: Generate grocery list from current week's meal plan
    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const { start, end } = getCurrentWeekRange()
            const result = await generateGroceryList(
                formatForDatabase(start),
                formatForDatabase(end)
            )
            if (result.success) {
                setGroups(result.data.groups)
                setTotalItems(result.data.totalItems)
                setCheckedItems(result.data.checkedItems)
            }
        } finally {
            setIsGenerating(false)
        }
    }

    // T216: Toggle item with optimistic update
    const handleToggleItem = async (itemId: string, isChecked: boolean) => {
        // Optimistic update
        setTogglingIds(prev => new Set(prev).add(itemId))
        setGroups(prev => prev.map(g => ({
            ...g,
            items: g.items.map(i =>
                i.id === itemId ? { ...i, is_checked: isChecked } : i
            ),
        })))
        setCheckedItems(prev => isChecked ? prev + 1 : prev - 1)

        const result = await toggleGroceryItemChecked(itemId, isChecked)
        if (!result.success) {
            // Revert on failure
            setGroups(prev => prev.map(g => ({
                ...g,
                items: g.items.map(i =>
                    i.id === itemId ? { ...i, is_checked: !isChecked } : i
                ),
            })))
            setCheckedItems(prev => isChecked ? prev - 1 : prev + 1)
        }

        setTogglingIds(prev => {
            const next = new Set(prev)
            next.delete(itemId)
            return next
        })
    }

    // Remove item with optimistic update
    const handleRemoveItem = async (itemId: string) => {
        const removedItem = groups.flatMap(g => g.items).find(i => i.id === itemId)
        if (!removedItem) return

        // Optimistic removal
        setGroups(prev => prev
            .map(g => ({
                ...g,
                items: g.items.filter(i => i.id !== itemId),
            }))
            .filter(g => g.items.length > 0)
        )
        setTotalItems(prev => prev - 1)
        if (removedItem.is_checked) setCheckedItems(prev => prev - 1)

        const result = await deleteGroceryItem(itemId)
        if (!result.success) {
            fetchList() // Refetch on failure
        }
    }

    // T217: Clear completed items
    const handleClearCompleted = async () => {
        const prevGroups = groups
        const prevTotal = totalItems
        const prevChecked = checkedItems

        // Optimistic removal of checked items
        setGroups(prev => prev
            .map(g => ({
                ...g,
                items: g.items.filter(i => !i.is_checked),
            }))
            .filter(g => g.items.length > 0)
        )
        setTotalItems(prev => prev - checkedItems)
        setCheckedItems(0)

        const result = await clearCompletedGroceryItems()
        if (!result.success) {
            setGroups(prevGroups)
            setTotalItems(prevTotal)
            setCheckedItems(prevChecked)
        }
    }

    // T218: Share functionality
    const handleShare = async () => {
        const result = await generateShareableGroceryList()
        if (result.success) {
            setShareText(result.data.text)
            setShowShareModal(true)
        }
    }

    // Add custom item
    const handleAddCustom = async (
        customName: string,
        quantity: number,
        unit: string,
        category: IngredientCategory,
        notes?: string
    ) => {
        const result = await addCustomGroceryItem(customName, quantity, unit, category, notes)
        if (result.success) {
            fetchList() // Refresh to get the new item properly grouped
        }
    }

    // Login prompt for unauthenticated users
    if (!authLoading && !user) {
        return (
            <div className="container mx-auto px-4 py-6">
                <h1 className="mb-4 text-2xl font-bold text-foreground">
                    Danh sách mua sắm 🛒
                </h1>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                    <span className="mb-4 text-5xl">🔒</span>
                    <h2 className="mb-2 text-lg font-semibold text-foreground">
                        Đăng nhập để quản lý danh sách
                    </h2>
                    <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                        Bạn cần đăng nhập để tạo và quản lý danh sách mua sắm.
                    </p>
                    <Link
                        href="/login"
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        )
    }

    // Loading skeleton
    if (isLoading || authLoading) {
        return <GrocerySkeleton />
    }

    return (
        <div className="container mx-auto px-4 py-6" data-testid="grocery-content">
            {/* Header */}
            <section className="mb-4">
                <h1 className="mb-1 text-2xl font-bold text-foreground xs:text-3xl">
                    Danh sách mua sắm 🛒
                </h1>
                <p className="text-sm text-muted-foreground">
                    Nguyên liệu cần mua cho tuần này
                </p>
            </section>

            {/* T212: Action bar */}
            <section className="mb-6">
                <ActionBar
                    totalItems={totalItems}
                    checkedItems={checkedItems}
                    uncheckedItems={totalItems - checkedItems}
                    onGenerate={handleGenerate}
                    onAddCustom={() => setShowAddModal(true)}
                    onClearCompleted={handleClearCompleted}
                    onShare={handleShare}
                    isGenerating={isGenerating}
                />
            </section>

            {/* T215: Category-based grouping */}
            {groups.length > 0 ? (
                <section data-testid="grocery-groups">
                    {groups.map(group => (
                        <CategorySection
                            key={group.category}
                            group={group}
                            onToggleItem={handleToggleItem}
                            onRemoveItem={handleRemoveItem}
                            togglingIds={togglingIds}
                        />
                    ))}
                </section>
            ) : (
                <section data-testid="grocery-empty">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                        <span className="mb-4 text-5xl">🛒</span>
                        <h2 className="mb-2 text-lg font-semibold text-foreground">
                            Chưa có nguyên liệu nào
                        </h2>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                            Thêm công thức vào kế hoạch bữa ăn, rồi bấm &quot;Tạo từ kế hoạch&quot; để tự động tạo danh sách mua sắm.
                        </p>
                        <Link
                            href="/planner"
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Đi tới Kế hoạch
                        </Link>
                    </div>
                </section>
            )}

            {/* T210: Add custom item modal */}
            <AddCustomItemModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddCustom}
            />

            {/* T211: Share modal */}
            <ShareListModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareText={shareText}
            />
        </div>
    )
}
