'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormFieldProps {
    label: string
    name: string
    type?: string
    placeholder?: string
    error?: string
    required?: boolean
    autoComplete?: string
    defaultValue?: string
}

/**
 * FormField - Input wrapper with label and error display
 */
export function FormField({
    label,
    name,
    type = 'text',
    placeholder,
    error,
    required,
    autoComplete,
    defaultValue,
}: FormFieldProps) {
    return (
        <Input
            label={label}
            name={name}
            type={type}
            placeholder={placeholder}
            error={error}
            required={required}
            autoComplete={autoComplete}
            defaultValue={defaultValue}
        />
    )
}

interface AuthFormProps {
    title: string
    children: React.ReactNode
    action: (formData: FormData) => Promise<void> | void
    submitLabel: string
    isLoading?: boolean
    error?: string | null
    footer?: React.ReactNode
}

/**
 * AuthForm - Wrapper for authentication forms with consistent styling
 */
export function AuthForm({
    title,
    children,
    action,
    submitLabel,
    isLoading,
    error,
    footer,
}: AuthFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    {error && (
                        <div
                            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}
                    {children}
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                        data-testid="auth-submit"
                    >
                        {submitLabel}
                    </Button>
                </form>
                {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
            </CardContent>
        </Card>
    )
}
