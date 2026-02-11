'use client'

import Link from 'next/link'

/**
 * T239, T250: Error boundary for the main app route group
 * Catches errors in any page within (main)/ and shows a recovery UI
 */
export default function MainError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <span className="mb-4 text-6xl">⚠️</span>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
                Đã xảy ra lỗi
            </h1>
            <p className="mb-2 max-w-sm text-sm text-muted-foreground">
                {error.message || 'Không thể tải trang này. Vui lòng thử lại.'}
            </p>
            {error.digest && (
                <p className="mb-4 font-mono text-xs text-muted-foreground/60">
                    Mã lỗi: {error.digest}
                </p>
            )}
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Thử lại
                </button>
                <Link
                    href="/"
                    className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Trang chủ
                </Link>
            </div>
        </div>
    )
}
