'use client'

/**
 * T170: QuickNoteModal - modal for adding a text note to meal plan
 */

import * as React from 'react'
import { Modal } from '@/components/ui/modal'
import type { MealType } from '@/lib/validations/meal-plan'
import { MEAL_TYPE_LABELS } from '@/lib/validations/meal-plan'

interface QuickNoteModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (note: string) => void
    mealType: MealType
}

export function QuickNoteModal({
    isOpen,
    onClose,
    onSave,
    mealType,
}: QuickNoteModalProps) {
    const [note, setNote] = React.useState('')
    const [error, setError] = React.useState('')

    React.useEffect(() => {
        if (isOpen) {
            setNote('')
            setError('')
        }
    }, [isOpen])

    const handleSave = () => {
        const trimmed = note.trim()
        if (!trimmed) {
            setError('Vui lòng nhập ghi chú')
            return
        }
        if (trimmed.length > 200) {
            setError('Ghi chú tối đa 200 ký tự')
            return
        }
        onSave(trimmed)
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Ghi chú - ${MEAL_TYPE_LABELS[mealType]}`}
        >
            <div className="space-y-4" data-testid="quick-note-modal">
                <div>
                    <textarea
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value)
                            setError('')
                        }}
                        placeholder="VD: Ăn cơm tấm ngoài quán, Mua trái cây..."
                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                        rows={3}
                        maxLength={200}
                        data-testid="note-input"
                        autoFocus
                    />
                    <div className="mt-1 flex items-center justify-between text-xs">
                        {error ? (
                            <span className="text-destructive">{error}</span>
                        ) : (
                            <span />
                        )}
                        <span className="text-muted-foreground">{note.length}/200</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!note.trim()}
                        className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        data-testid="save-note-button"
                    >
                        Lưu ghi chú
                    </button>
                </div>
            </div>
        </Modal>
    )
}
