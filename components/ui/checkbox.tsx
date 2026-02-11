'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string
    error?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

        return (
            <div className="flex flex-col">
                <div className="flex items-center">
                    <label
                        htmlFor={checkboxId}
                        className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center"
                    >
                        <input
                            ref={ref}
                            id={checkboxId}
                            type="checkbox"
                            className={cn(
                                'h-4 w-4 rounded border-input text-primary ring-offset-background',
                                'focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                                error && 'border-destructive',
                                className
                            )}
                            {...props}
                        />
                    </label>
                    {label && (
                        <span
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {label}
                        </span>
                    )}
                </div>
                {error && (
                    <p className="mt-1 text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
