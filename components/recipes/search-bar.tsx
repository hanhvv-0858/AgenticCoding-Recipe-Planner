'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
    onSearch: (query: string) => void
    onFilterClick?: () => void
    placeholder?: string
    initialValue?: string
    hasActiveFilters?: boolean
    className?: string
}

export function SearchBar({
    onSearch,
    onFilterClick,
    placeholder = 'Tìm kiếm món ăn...',
    initialValue = '',
    hasActiveFilters = false,
    className,
}: SearchBarProps) {
    const [value, setValue] = useState(initialValue)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const debouncedSearch = useCallback(
        (searchValue: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
            debounceRef.current = setTimeout(() => {
                onSearch(searchValue)
            }, 300)
        },
        [onSearch]
    )

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        debouncedSearch(newValue)
    }

    const handleClear = () => {
        setValue('')
        onSearch('')
        inputRef.current?.focus()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }
        onSearch(value)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn('flex items-center gap-2', className)}
            data-testid="search-bar"
        >
            <div className="relative flex-1">
                {/* Search icon */}
                <svg
                    className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                <input
                    ref={inputRef}
                    type="search"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={200}
                    className="h-12 w-full rounded-xl border border-border bg-card px-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="search-input"
                    aria-label="Tìm kiếm công thức"
                />

                {/* Clear button */}
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-0 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Xóa tìm kiếm"
                        data-testid="search-clear"
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filter button */}
            {onFilterClick && (
                <button
                    type="button"
                    onClick={onFilterClick}
                    className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-colors',
                        hasActiveFilters
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label="Bộ lọc"
                    data-testid="filter-button"
                >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {hasActiveFilters && (
                        <span className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-primary" />
                    )}
                </button>
            )}
        </form>
    )
}
