import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Đăng nhập - Recipe Planner',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary">🍳 Recipe Planner</h1>
                    <p className="mt-2 text-muted-foreground">
                        Lên thực đơn & danh sách mua sắm
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
