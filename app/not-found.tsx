import Link from 'next/link'

/**
 * T250: Root not-found page — shown for any unmatched route
 */
export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
            <span className="mb-4 text-7xl">🔍</span>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
                404 — Không tìm thấy trang
            </h1>
            <p className="mb-8 max-w-md text-sm text-muted-foreground">
                Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
                Hãy quay lại trang chủ để khám phá công thức nấu ăn.
            </p>
            <Link
                href="/"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                ← Quay lại trang chủ
            </Link>
        </div>
    )
}
