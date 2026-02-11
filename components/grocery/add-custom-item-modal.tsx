'use client'

/**
 * AddCustomItemModal Component (T210)
 * Modal for adding custom grocery items
 */

import { useState } from 'react'
import {
    INGREDIENT_CATEGORIES,
    CATEGORY_LABELS,
    type IngredientCategory,
    addCustomGroceryItemSchema,
} from '@/lib/validations/grocery-list'
import { extractFieldErrors } from '@/lib/utils/validation'

interface AddCustomItemModalProps {
    open: boolean
    onClose: () => void
    onAdd: (customName: string, quantity: number, unit: string, category: IngredientCategory, notes?: string) => void
}

export function AddCustomItemModal({ open, onClose, onAdd }: AddCustomItemModalProps) {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [unit, setUnit] = useState('cái')
    const [category, setCategory] = useState<IngredientCategory>('other')
    const [notes, setNotes] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    if (!open) return null

    const handleSubmit = () => {
        setFieldErrors({})

        const qty = parseFloat(quantity)
        const validation = addCustomGroceryItemSchema.safeParse({
            customName: name.trim(),
            quantity: isNaN(qty) ? 0 : qty,
            unit: unit.trim(),
            category,
            notes: notes.trim() || undefined,
        })

        if (!validation.success) {
            setFieldErrors(extractFieldErrors(validation.error))
            return
        }

        onAdd(validation.data.customName, validation.data.quantity, validation.data.unit, validation.data.category, validation.data.notes)
        handleClose()
    }

    const handleClose = () => {
        setName('')
        setQuantity('1')
        setUnit('cái')
        setCategory('other')
        setNotes('')
        setFieldErrors({})
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" data-testid="add-custom-item-modal">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

            {/* Modal */}
            <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-background p-4 shadow-xl sm:rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                    ➕ Thêm nguyên liệu
                </h3>

                <div className="space-y-3">
                    {/* Name */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Tên nguyên liệu *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setFieldErrors(prev => { const { customName: _, ...rest } = prev; return rest }) }}
                            placeholder="VD: Bơ, Sữa tươi..."
                            className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 ${fieldErrors.customName ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'}`}
                            data-testid="custom-item-name"
                            maxLength={100}
                            autoFocus
                            aria-invalid={fieldErrors.customName ? 'true' : undefined}
                        />
                        {fieldErrors.customName && (
                            <p className="mt-1 text-xs text-destructive" role="alert">{fieldErrors.customName}</p>
                        )}
                    </div>

                    {/* Quantity + Unit */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Số lượng *
                            </label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => { setQuantity(e.target.value); setFieldErrors(prev => { const { quantity: _, ...rest } = prev; return rest }) }}
                                min="0.01"
                                step="0.1"
                                className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 ${fieldErrors.quantity ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'}`}
                                data-testid="custom-item-quantity"
                                aria-invalid={fieldErrors.quantity ? 'true' : undefined}
                            />
                            {fieldErrors.quantity && (
                                <p className="mt-1 text-xs text-destructive" role="alert">{fieldErrors.quantity}</p>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Đơn vị *
                            </label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => { setUnit(e.target.value); setFieldErrors(prev => { const { unit: _, ...rest } = prev; return rest }) }}
                                placeholder="g, ml, cái..."
                                className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 ${fieldErrors.unit ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'}`}
                                data-testid="custom-item-unit"
                                maxLength={20}
                                aria-invalid={fieldErrors.unit ? 'true' : undefined}
                            />
                            {fieldErrors.unit && (
                                <p className="mt-1 text-xs text-destructive" role="alert">{fieldErrors.unit}</p>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Danh mục
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            data-testid="custom-item-category"
                        >
                            {INGREDIENT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ghi chú thêm (tuỳ chọn)"
                            className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 ${fieldErrors.notes ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'}`}
                            data-testid="custom-item-notes"
                            maxLength={200}
                            aria-invalid={fieldErrors.notes ? 'true' : undefined}
                        />
                        {fieldErrors.notes && (
                            <p className="mt-1 text-xs text-destructive" role="alert">{fieldErrors.notes}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        data-testid="add-custom-item-submit"
                    >
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    )
}
