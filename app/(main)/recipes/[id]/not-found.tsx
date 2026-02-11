import Link from 'next/link'

export default function RecipeNotFound() {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <span className="mb-4 text-6xl">🍳</span>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
                Không tìm thấy công thức
            </h1>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Công thức bạn đang tìm có thể đã bị xóa hoặc không tồn tại.
            </p>
            <Link
                href="/"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                ← Quay lại trang chủ
            </Link>
        </div>
    )
}
