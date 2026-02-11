'use client'

import * as React from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { AuthForm, FormField } from '@/components/auth'
import { signUpSchema } from '@/lib/validations/auth'
import { extractFieldErrors } from '@/lib/utils/validation'

export default function RegisterPage() {
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

    async function handleSubmit(formData: FormData) {
        setError(null)
        setFieldErrors({})
        setIsLoading(true)

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string
        const displayName = (formData.get('displayName') as string) || undefined

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' })
            setIsLoading(false)
            return
        }

        // Client-side Zod validation
        const validation = signUpSchema.safeParse({ email, password, displayName })
        if (!validation.success) {
            setFieldErrors(extractFieldErrors(validation.error))
            setIsLoading(false)
            return
        }

        try {
            const result = await signUp({ email, password, displayName })

            // If we get here, signUp didn't redirect (error occurred)
            if (result?.error) {
                setError(result.error.message)
            }
        } catch (err) {
            if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
                throw err
            }
            setError('Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthForm
            title="Đăng ký tài khoản"
            action={handleSubmit}
            submitLabel="Đăng ký"
            isLoading={isLoading}
            error={error}
            footer={
                <>
                    <span className="text-muted-foreground">Đã có tài khoản? </span>
                    <Link href="/login" className="text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </>
            }
        >
            <FormField
                label="Tên hiển thị"
                name="displayName"
                type="text"
                placeholder="Nhập tên hiển thị (tùy chọn)"
                autoComplete="name"
                error={fieldErrors.displayName}
            />
            <FormField
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                error={fieldErrors.email}
            />
            <FormField
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="Ít nhất 8 ký tự, gồm chữ hoa, thường, số"
                required
                autoComplete="new-password"
                error={fieldErrors.password}
            />
            <FormField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                required
                autoComplete="new-password"
                error={fieldErrors.confirmPassword}
            />
        </AuthForm>
    )
}
