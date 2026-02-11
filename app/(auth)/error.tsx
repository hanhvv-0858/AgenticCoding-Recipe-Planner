'use client'

import Link from 'next/link'

/**
 * T239: Error boundary for auth routes (login/register)
 */
export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <span className="mb-4 text-5xl">🔒</span>
            <h1 className="mb-2 text-xl font-bold text-foreground">
                Lỗi xác thực
            </h1>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                {error.message || 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.'}
            </p>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Thử lại
                </button>
                <Link
                    href="/login"
                    className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Đăng nhập
                </Link>
            </div>
        </div>
    )
}
