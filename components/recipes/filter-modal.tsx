'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface FilterValues {
    maxCookingTime?: number
    maxCalories?: number
    minRating?: number
    difficulty?: 'easy' | 'medium' | 'hard'
}

interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: FilterValues) => void
    initialValues?: FilterValues
}

const TIME_OPTIONS = [
    { label: 'Bất kỳ', value: undefined },
    { label: '≤ 15 phút', value: 15 },
    { label: '≤ 30 phút', value: 30 },
    { label: '≤ 60 phút', value: 60 },
    { label: '≤ 2 giờ', value: 120 },
]

const CALORIE_OPTIONS = [
    { label: 'Bất kỳ', value: undefined },
    { label: '≤ 200 cal', value: 200 },
    { label: '≤ 300 cal', value: 300 },
    { label: '≤ 500 cal', value: 500 },
    { label: '≤ 800 cal', value: 800 },
]

const RATING_OPTIONS = [
    { label: 'Bất kỳ', value: undefined },
    { label: '⭐ 3+', value: 3 },
    { label: '⭐ 4+', value: 4 },
    { label: '⭐ 4.5+', value: 4.5 },
]

const DIFFICULTY_OPTIONS = [
    { label: 'Bất kỳ', value: undefined },
    { label: '🟢 Dễ', value: 'easy' as const },
    { label: '🟡 Trung bình', value: 'medium' as const },
    { label: '🔴 Khó', value: 'hard' as const },
]

export function FilterModal({ isOpen, onClose, onApply, initialValues = {} }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterValues>(initialValues)

    const handleApply = () => {
        onApply(filters)
        onClose()
    }

    const handleReset = () => {
        setFilters({})
    }

    const activeCount = Object.values(filters).filter(v => v !== undefined).length

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bộ lọc" size="md">
            <div className="space-y-6" data-testid="filter-modal">
                {/* Cooking Time */}
                <FilterSection
                    label="⏱️ Thời gian nấu"
                    options={TIME_OPTIONS}
                    value={filters.maxCookingTime}
                    onChange={(v) => setFilters(prev => ({ ...prev, maxCookingTime: v as number | undefined }))}
                />

                {/* Calories */}
                <FilterSection
                    label="🔥 Calories"
                    options={CALORIE_OPTIONS}
                    value={filters.maxCalories}
                    onChange={(v) => setFilters(prev => ({ ...prev, maxCalories: v as number | undefined }))}
                />

                {/* Rating */}
                <FilterSection
                    label="⭐ Đánh giá"
                    options={RATING_OPTIONS}
                    value={filters.minRating}
                    onChange={(v) => setFilters(prev => ({ ...prev, minRating: v as number | undefined }))}
                />

                {/* Difficulty */}
                <FilterSection
                    label="📊 Độ khó"
                    options={DIFFICULTY_OPTIONS}
                    value={filters.difficulty}
                    onChange={(v) => setFilters(prev => ({ ...prev, difficulty: v as FilterValues['difficulty'] }))}
                />

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                        data-testid="filter-reset"
                    >
                        Xóa bộ lọc {activeCount > 0 && `(${activeCount})`}
                    </Button>
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={handleApply}
                        data-testid="filter-apply"
                    >
                        Áp dụng
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

function FilterSection({
    label,
    options,
    value,
    onChange,
}: {
    label: string
    options: { label: string; value: string | number | undefined }[]
    value: string | number | undefined
    onChange: (value: string | number | undefined) => void
}) {
    return (
        <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">{label}</h4>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option.label}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`min-h-[44px] rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${value === option.value || (value === undefined && option.value === undefined)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                            }`}
                        data-testid={`filter-option-${option.label}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export type { FilterValues }
