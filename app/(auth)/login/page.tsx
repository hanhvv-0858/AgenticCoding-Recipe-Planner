'use client'

import * as React from 'react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { AuthForm, FormField } from '@/components/auth'
import { signInSchema } from '@/lib/validations/auth'
import { extractFieldErrors } from '@/lib/utils/validation'

export default function LoginPage() {
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

    async function handleSubmit(formData: FormData) {
        setError(null)
        setFieldErrors({})
        setIsLoading(true)

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Client-side Zod validation
        const validation = signInSchema.safeParse({ email, password })
        if (!validation.success) {
            setFieldErrors(extractFieldErrors(validation.error))
            setIsLoading(false)
            return
        }

        try {
            const result = await signIn({ email, password })

            // If we get here, signIn didn't redirect (error occurred)
            if (result?.error) {
                setError(result.error.message)
            }
        } catch (err) {
            // NEXT_REDIRECT is thrown by redirect() — let it propagate
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
            title="Đăng nhập"
            action={handleSubmit}
            submitLabel="Đăng nhập"
            isLoading={isLoading}
            error={error}
            footer={
                <>
                    <span className="text-muted-foreground">Chưa có tài khoản? </span>
                    <Link href="/register" className="text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </>
            }
        >
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
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
                error={fieldErrors.password}
            />
        </AuthForm>
    )
}
