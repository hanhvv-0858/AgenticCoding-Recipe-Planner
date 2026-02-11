'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: SelectOption[]
    label?: string
    error?: string
    placeholder?: string
    onChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            options,
            label,
            error,
            placeholder = 'Chọn một tùy chọn',
            onChange,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) {
                onChange(e.target.value)
            }
        }

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        {label}
                        {props.required && (
                            <span className="ml-1 text-destructive">*</span>
                        )}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        aria-invalid={error ? 'true' : undefined}
                        aria-describedby={error ? `${selectId}-error` : undefined}
                        className={cn(
                            'flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-destructive focus-visible:ring-destructive',
                            className
                        )}
                        onChange={handleChange}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Dropdown Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg
                            className="h-4 w-4 text-muted-foreground"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
                {error && <p id={`${selectId}-error`} className="mt-1 text-sm text-destructive" role="alert">{error}</p>}
            </div>
        )
    }
)

Select.displayName = 'Select'

export { Select }
