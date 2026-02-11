'use client'

/**
 * T239: Global error boundary — catches unhandled errors across the entire app
 * This replaces the default Next.js error page with a styled Vietnamese error page
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="vi">
            <body className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="mx-auto max-w-md text-center">
                    <span className="mb-4 block text-6xl">💥</span>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                        Đã xảy ra lỗi nghiêm trọng
                    </h1>
                    <p className="mb-6 text-sm text-gray-600">
                        Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
                    </p>
                    {error.digest && (
                        <p className="mb-4 font-mono text-xs text-gray-400">
                            Mã lỗi: {error.digest}
                        </p>
                    )}
                    <button
                        onClick={reset}
                        className="rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    >
                        Thử lại
                    </button>
                </div>
            </body>
        </html>
    )
}
